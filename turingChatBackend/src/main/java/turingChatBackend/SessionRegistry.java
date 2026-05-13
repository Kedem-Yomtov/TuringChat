package turingChatBackend;

import org.springframework.stereotype.Component;

import java.util.concurrent.ConcurrentHashMap;

//Tracks active WebSocket sessions, mapping them to players and rooms
@Component
public class SessionRegistry {

    private final ConcurrentHashMap<String, String> sessionToPlayer = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, String> sessionToRoom = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, String> playerToSession = new ConcurrentHashMap<>();

    public void register(String sessionId, String roomCode, String playerId) {
        sessionToPlayer.put(sessionId, playerId);
        sessionToRoom.put(sessionId, roomCode);
        playerToSession.put(playerId, sessionId);
    }

    public String getPlayer(String sessionId) { return sessionToPlayer.get(sessionId);}
    public String getRoom(String sessionId) { return sessionToRoom.get(sessionId);}
    public String getLatestSession(String playerId) {  return playerToSession.get(playerId); }
    public boolean isLatestSession(String playerId, String sessionId) { return sessionId != null && sessionId.equals(playerToSession.get(playerId));}

    public void remove(String sessionId) {
        String playerId = sessionToPlayer.remove(sessionId);
        sessionToRoom.remove(sessionId);

        // only remove mapping if it's still the latest session
        if (playerId != null && sessionId.equals(playerToSession.get(playerId))) {
            playerToSession.remove(playerId);
        }
    }
}