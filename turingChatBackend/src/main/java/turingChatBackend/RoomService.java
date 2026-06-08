package turingChatBackend;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;

//Handles all room logic including creation, joining,, starting games, and broadcasting state updates 
@Service
public class RoomService {

    private String quickJoinRoomCode = null;

    private final ConversationStarterService conversationStarterService;
    private final RoomRepository roomRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final BotService botService;
    
    ////IMPORTANT, decides how long a round is (in seconds)//
    private final int gameDuration = 90;
    /////////////////////////////////////////////////////////
    
    private final VotingService votingService;
    
    public RoomService(RoomRepository roomRepository,
            SimpMessagingTemplate messagingTemplate,
            BotService botService,
            VotingService votingService,
            ConversationStarterService conversationStarterService
            ) {

			this.roomRepository = roomRepository;
			this.messagingTemplate = messagingTemplate;
			this.botService = botService;
			this.votingService = votingService;
			this.conversationStarterService = conversationStarterService;

    }


    public Room createRoom(String adminId) {
    	
        String roomCode = generateRoomCode();
        Room room = new Room(roomCode);

        //player who creates the room is default admin
        room.addPlayer(adminId, true);

        Room saved = roomRepository.save(room);
        broadcast(saved);

        return saved;
    }


    //add players to placeholder room until its started or room is full
    public synchronized Room quickJoin(String playerId) {

        // validate existing quick join room
        if (quickJoinRoomCode != null) {
            Room existing = roomRepository.findByRoomCode(quickJoinRoomCode)
                    .orElse(null);

            // if room is full or null set roomcode to null
            if (existing == null
                    || existing.isFull()
                    || !"WAITING".equals(existing.getStatus())) {
                quickJoinRoomCode = null;
            }
        }

        // create new room if needed
        if (quickJoinRoomCode == null) {
            Room room = createRoom(playerId);
            quickJoinRoomCode = room.getRoomCode();
            return room;
        }

        // join existing valid waiting room
        Room room = roomRepository.findByRoomCode(quickJoinRoomCode)
                .orElseThrow(() -> new RuntimeException("Room not found"));

        // safety, if somehow not waiting, reset
        if (!"WAITING".equals(room.getStatus())) {
            quickJoinRoomCode = null;
            return quickJoin(playerId);
        }

        return joinRoom(room.getRoomCode(), playerId);
    }

   
    public Room joinRoom(String roomCode, String playerId) {

        Room room = roomRepository.findByRoomCode(roomCode)
                .orElseThrow(() -> new RuntimeException("Room not found"));

        boolean alreadyInRoom = room.getPlayers()
                .stream()
                .anyMatch(p ->
                    normalize(p.getPlayerId())
                        .equals(normalize(playerId))
                );

        if (!alreadyInRoom) {
            room.addPlayer(playerId, false);
        } else {
            room.getPlayers().stream()
                    .filter(p -> normalize(p.getPlayerId()).equals(playerId))
                    .forEach(p -> p.setOnline(true));
        }

        // ALWAYS enforce admin AFTER mutation
        ensureAdminExists(room);

        Room saved = roomRepository.save(room);
        broadcast(saved);

        return saved;
    }
   
    public Room startGame(String roomCode, String playerId, String language) {

        Room room = roomRepository.findByRoomCode(roomCode)
                .orElseThrow(() -> new RuntimeException("Room not found"));

        String cleanPlayerId = normalize(playerId);

        boolean isAdmin = room.getPlayers().stream()
                .filter(p -> normalize(p.getPlayerId()).equals(cleanPlayerId))
                .findFirst()
                .map(Player::isAdmin)
                .orElse(false);

        if (!isAdmin) {
            throw new RuntimeException("Only admin can start the game");
        }

       //set game state
        room.setStatus("IN_GAME");

        long gameEndsAt = gameDuration * 1000L;
        room.setEndTime(gameEndsAt);


        //create bot
        String botId = "BOT_" + UUID.randomUUID();
        Player bot = room.addPlayer(botId, false);
        bot.setBot(true);
        bot.setOnline(true);

        String prompt = conversationStarterService.getRandomStarter(language);

        String languageMessage =
                "hebrew".equalsIgnoreCase(language)
                        ? "המשחק יתקיים בעברית"
                        : "The game will be played in English";

        // persist chat messages BEFORE save
        room.addChatMessage("SYSTEM: " + languageMessage);
        room.addChatMessage("SYSTEM: " + prompt);

        Room saved = roomRepository.save(room);

        // broadcast game start
        messagingTemplate.convertAndSend(
                "/topic/room/" + roomCode + "/game-start",
                Map.of(
                        "type", "GAME_START",
                        "gameEndsAt", gameEndsAt
                )
        );

        broadcast(saved);

        // async gameplay flow
        new Thread(() -> {
            try {
                Thread.sleep(7000);

                messagingTemplate.convertAndSend(
                        "/topic/room/" + roomCode + "/chat",
                        new ChatMessage(roomCode, "SYSTEM", languageMessage, "SYSTEM", false)
                );

                Thread.sleep(500);

                messagingTemplate.convertAndSend(
                        "/topic/room/" + roomCode + "/chat",
                        new ChatMessage(roomCode, "SYSTEM", prompt, "SYSTEM", false)
                );

                Thread.sleep(2000);
                botService.startBot(roomCode, bot.getColor());

            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }).start();
        
        //start game timer
        new Thread(() -> {
            try {
                Thread.sleep(gameDuration * 1000L + 4000); //account for countdown timer
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }

            room.setStatus("VOTING");
            roomRepository.save(room);

            broadcast(room);
            votingService.startVoting(roomCode);
        }).start();
        return saved;
    }

    public Room resetRoom(String roomCode) {

        Room room = roomRepository.findByRoomCode(roomCode)
                .orElseThrow(() -> new RuntimeException("Room not found"));

        room.resetForNewRound();
        ensureAdminExists(room);
        Room saved = roomRepository.saveAndFlush(room);
        broadcast(saved);
        return saved;
    }
    public static void ensureAdminExists(Room room) {

        List<Player> onlineHumans = room.getPlayers()
                .stream()
                .filter(Player::isOnline)
                .filter(p -> !p.isBot())   // 👈 IMPORTANT
                .toList();

        if (onlineHumans.isEmpty()) {
            // fallback: if only bots exist, do NOT assign admin to bot
            return;
        }

        // clear all admins first
        room.getPlayers().forEach(p -> p.setAdmin(false));

        // assign admin to first ONLINE HUMAN player
        onlineHumans.get(0).setAdmin(true);
    }    
    //broadcast room state to players
    public void broadcast(Room room) {
        messagingTemplate.convertAndSend(
                "/topic/room/" + room.getRoomCode() + "/state",
                room
        );
    }

    public Room getRoom(String roomCode) {
        return roomRepository.findByRoomCode(roomCode)
                .orElseThrow(() -> new RuntimeException("Room not found"));
    }

    private String generateRoomCode() {
        return UUID.randomUUID().toString().substring(0, 6).toUpperCase();
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
    
    public void setPlayerOnline(String roomCode, String playerId, boolean online) {

        Room room = roomRepository.findByRoomCode(roomCode)
                .orElseThrow(() -> new RuntimeException("Room not found"));

        String cleanId = normalize(playerId);

        room.getPlayers().stream()
                .filter(p -> normalize(p.getPlayerId()).equals(cleanId))
                .forEach(p -> p.setOnline(online));

        ensureAdminExists(room);

        Room saved = roomRepository.save(room);
        broadcast(saved);
    }
}