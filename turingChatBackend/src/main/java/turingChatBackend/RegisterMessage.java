package turingChatBackend;

//DTO for when a player joins a room, carrying roomcode and player ID
public class RegisterMessage {
    private String roomCode;
    private String playerId;

    public String getRoomCode() { return roomCode; }
    public void setRoomCode(String roomCode) { this.roomCode = roomCode; }

    public String getPlayerId() { return playerId; }
    public void setPlayerId(String playerId) { this.playerId = playerId; }
}