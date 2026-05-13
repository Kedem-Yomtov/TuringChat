package turingChatBackend;
import java.util.List;
import java.util.Map;

//A DTO that exposes a room’s state to the frontend.
public class RoomDTO {
    public String roomCode;
    public String status;
    public List<PlayerDTO> players;
    public Map<String, Object> endResult;
    
    public static RoomDTO from(Room room) {
        RoomDTO dto = new RoomDTO();
        dto.roomCode = room.getRoomCode();
        dto.status = room.getStatus();
        dto.players = room.getPlayers().stream().map(p -> {
            PlayerDTO pd = new PlayerDTO();
            pd.playerId = p.getPlayerId();
            pd.color = p.getColor();
            pd.admin = p.isAdmin();
            pd.online = p.isOnline();
            return pd;
        }).toList();
        dto.endResult = room.getEndResult();
        return dto;
    }
}