package turingChatBackend;

//A DTO representing a player’s public state sent between backend and frontend.
public class PlayerDTO {
    public String playerId;
    public String color;
    public boolean admin;
	public boolean online;

    public static PlayerDTO from(Player p) {
        PlayerDTO dto = new PlayerDTO();
        dto.playerId = p.getPlayerId();
        dto.color = p.getColor();
        dto.admin = p.isAdmin();
        dto.online = p.isOnline();
        return dto;
    }
}