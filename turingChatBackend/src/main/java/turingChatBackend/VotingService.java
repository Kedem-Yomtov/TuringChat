package turingChatBackend;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class VotingService {

    private final VoteService voteService;
    private final SimpMessagingTemplate messagingTemplate;
    private final RoomRepository roomRepository;

    private final long VOTING_DURATION_MS = 20_000;

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

        long endTime = System.currentTimeMillis() + VOTING_DURATION_MS;

        Thread t = new Thread(() -> {

            while (true) {

                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    return;
                }

                Room room = roomRepository.findByRoomCode(roomCode).orElse(null);
                if (room == null) return;

                if (!"VOTING".equals(room.getStatus())) return;


                List<Player> activePlayers = room.getPlayers()
                        .stream()
                        .filter(Player::isOnline)
                        .filter(p -> !p.isBot())
                        .toList();

                Set<String> expectedVoters = activePlayers.stream()
                        .map(Player::getPlayerId)
                        .collect(Collectors.toSet());


                Set<String> actualVoters = voteService.getVotes(roomCode)
                        .stream()
                        .map(Vote::getVoterId)
                        .collect(Collectors.toSet());

                int voteCount = actualVoters.size();

                boolean allVoted = !expectedVoters.isEmpty()
                        && actualVoters.containsAll(expectedVoters);

                boolean timeUp = System.currentTimeMillis() >= endTime;

                if (allVoted || timeUp) {
                    System.out.println("Finishing Voting for room: " + roomCode);
                    finishVoting(roomCode);
                    return;
                }
            }
        });

        t.setDaemon(true);
        t.start();
    }

    private void finishVoting(String roomCode) {

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

        System.out.println("Voting Results for room " + roomCode);
        System.out.println("Total Votes: " + totalVotes);
        System.out.println("AI Votes: " + aiVotes);

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
       
    }
}