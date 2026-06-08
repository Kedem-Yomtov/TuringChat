package turingChatBackend;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.stream.Collectors;

@Service
public class VotingService {

    private final VoteService voteService;
    private final SimpMessagingTemplate messagingTemplate;
    private final RoomRepository roomRepository;

    private final long VOTING_DURATION_MS = 20_000;

    // prevents double-finishing per room
    private final Map<String, AtomicBoolean> finishingFlags = new ConcurrentHashMap<>();

    // snapshot of expected voters per room
    private final Map<String, Set<String>> expectedVotersPerRoom = new ConcurrentHashMap<>();

    public VotingService(VoteService voteService,
                         SimpMessagingTemplate messagingTemplate,
                         RoomRepository roomRepository) {
        this.voteService = voteService;
        this.messagingTemplate = messagingTemplate;
        this.roomRepository = roomRepository;
    }

    public void startVoting(String roomCode) {

        System.out.println("Started Voting for room: " + roomCode);

        voteService.clearVotes(roomCode);

        finishingFlags.put(roomCode, new AtomicBoolean(false));

        Room room = roomRepository.findByRoomCode(roomCode).orElse(null);
        if (room == null) return;

        Set<String> expectedVoters = room.getPlayers()
                .stream()
                .filter(Player::isOnline)
                .filter(p -> !p.isBot())
                .map(p -> normalize(p.getPlayerId()))
                .collect(Collectors.toSet());

        expectedVotersPerRoom.put(roomCode, expectedVoters);

        long endTime = System.currentTimeMillis() + VOTING_DURATION_MS;

        Thread t = new Thread(() -> {

            while (true) {

                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    return;
                }

                if (Boolean.TRUE.equals(finishingFlags.get(roomCode).get())) {
                    return;
                }

                Room currentRoom = roomRepository.findByRoomCode(roomCode).orElse(null);
                if (currentRoom == null) return;

                if (!"VOTING".equals(currentRoom.getStatus())) return;

                Set<String> actualVoters = voteService.getVotes(roomCode)
                        .stream()
                        .map(v -> normalize(v.getVoterId()))
                        .collect(Collectors.toSet());

                Set<String> expected = expectedVotersPerRoom.get(roomCode);
                if (expected == null || expected.isEmpty()) return;

                boolean allVoted =
                        expected.stream().allMatch(actualVoters::contains);

                boolean timeUp = System.currentTimeMillis() >= endTime;

                if (allVoted || timeUp) {
                    finishVoting(roomCode);
                    return;
                }
            }
        });

        t.setDaemon(true);
        t.start();
    }

    private void finishVoting(String roomCode) {

        AtomicBoolean flag = finishingFlags.get(roomCode);
        if (flag == null || !flag.compareAndSet(false, true)) {
            return; // already finished
        }

        System.out.println("Finishing Voting for room: " + roomCode);

        Room room = roomRepository.findByRoomCode(roomCode).orElse(null);
        if (room == null) return;

        Map<String, Long> results = voteService.countVotes(roomCode);

        String aiColor = room.getPlayers()
                .stream()
                .filter(Player::isBot)
                .findFirst()
                .map(Player::getColor)
                .orElse(null);

        long aiVotes = results.getOrDefault(aiColor, 0L);
        long totalVotes = results.values().stream().mapToLong(Long::longValue).sum();

        boolean win = totalVotes > 0 && aiVotes > totalVotes / 2;

        room.setStatus("END");

        room.setEndResult(Map.of(
                "results", results,
                "aiColor", aiColor,
                "win", win
        ));

        roomRepository.save(room);

        messagingTemplate.convertAndSend(
                "/topic/room/" + roomCode + "/state",
                RoomDTO.from(room)
        );

        voteService.clearVotes(roomCode);

        finishingFlags.remove(roomCode);
        expectedVotersPerRoom.remove(roomCode);
    }

    private String normalize(String id) {
        if (id == null) return null;

        id = id.trim();

        if (id.startsWith("\"") && id.endsWith("\"")) {
            id = id.substring(1, id.length() - 1);
        }

        if (id.startsWith("{")) {
            try {
                return id.substring(id.indexOf(":\"") + 2, id.lastIndexOf("\""));
            } catch (Exception e) {
                return id;
            }
        }

        return id;
    }
}