package turingChatBackend;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.context.event.EventListener;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import jakarta.transaction.Transactional;

//Manages player connections/disconnections
@Controller
public class WebSocketEventListener {
    private final Set<String> handledDisconnects = ConcurrentHashMap.newKeySet();
    private final SessionRegistry sessionRegistry;
    private final RoomRepository roomRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final Map<String, Long> lastConnectTime = new ConcurrentHashMap<>();
    
    public WebSocketEventListener(SessionRegistry sessionRegistry,
                                  RoomRepository roomRepository,
                                  SimpMessagingTemplate messagingTemplate) {
        this.sessionRegistry = sessionRegistry;
        this.roomRepository = roomRepository;
        this.messagingTemplate = messagingTemplate;
    }

    //connect user
    @MessageMapping("/connect")
    public void registerPlayer(
            @Header("roomCode") String roomCode,
            @Header("playerId") String playerId,
            SimpMessageHeaderAccessor accessor
    ) {
        String sessionId = accessor.getSessionId();
        sessionRegistry.register(sessionId, roomCode, playerId);
        //update last connect time
        lastConnectTime.put(sessionId, System.currentTimeMillis());

        Room room = roomRepository.findByRoomCode(roomCode).orElse(null);
        if (room == null) return;

        // only mark online, do not add player
        room.getPlayers().stream()
            .filter(p -> normalize(p.getPlayerId()).equals(normalize(playerId)))
            .forEach(p -> p.setOnline(true));

        
        roomRepository.save(room);

        messagingTemplate.convertAndSend(
            "/topic/room/" + roomCode + "/state",
            RoomDTO.from(room)
        );
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

    
    @EventListener
    @Transactional
    public void handleDisconnect(SessionDisconnectEvent event) {
        System.out.println("Disconnect was called");
        String sessionId = event.getSessionId();

        // prevent duplicate disconnect handling
        if (!handledDisconnects.add(sessionId)) {
            System.out.println("Duplicate disconnect ignored for session " + sessionId);
            return;
        }

        String roomCode = sessionRegistry.getRoom(sessionId);
        String playerId = sessionRegistry.getPlayer(sessionId);

        sessionRegistry.remove(sessionId);

        if (roomCode == null || playerId == null) {
            System.out.println("Disconnect ignored: missing room/player");
            return;
        }

        // Grace Period Check, helps with momentary disconnects on game start
        Long lastConnect = lastConnectTime.get(sessionId);
        long now = System.currentTimeMillis();

        if (lastConnect != null && (now - lastConnect) < 3000) {
            System.out.println("Ignoring transient disconnect (grace period) for " + playerId);
            return;
        }

        Room room = roomRepository.findByRoomCode(roomCode).orElse(null);
        if (room == null) {
            System.out.println("Disconnect ignored: room not found");
            return;
        }

        Player player = room.getPlayers()
                .stream()
                .filter(p -> p.getPlayerId().equals(playerId))
                .findFirst()
                .orElse(null);

        if (player == null) {
            System.out.println("Disconnect ignored: player not found");
            return;
        }

        // safety: ignore during transitions
        if ("COUNTDOWN".equals(room.getStatus())) {
            System.out.println("🟡 Ignoring disconnect during active game state");
            return;
        }

        // send disconnect message
        ChatMessage systemMsg = new ChatMessage(
                roomCode,
                playerId,
                player.getColor() + " left the chat",
                "SYSTEM",
                false
        );

        messagingTemplate.convertAndSend(
                "/topic/room/" + roomCode + "/chat",
                systemMsg
        );

        player.setOnline(false);
        System.out.println("setting " + player.getPlayerId() + " offline");

        if (player.isAdmin()) {
            player.setAdmin(false);
            RoomService.ensureAdminExists(room);
        }

        messagingTemplate.convertAndSend(
                "/topic/room/" + roomCode + "/state",
                RoomDTO.from(room)
        );

        roomRepository.save(room);

        System.out.println("Disconnected: " + playerId +
                "(" + player.getColor() + ") from room " + roomCode);
    }
}