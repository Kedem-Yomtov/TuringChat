package turingChatBackend;

//Represents a chat message in a room, including sender info, text, color, and whether it’s a system message.
public class ChatMessage {

    private String roomCode;
    private String playerId;
    private String text;
    private String color;

    //defines if its a message from users or from the system
    private Boolean system = false;

    public ChatMessage() {}

    public ChatMessage(String roomCode, String playerId, String text, String color, Boolean system) {
        this.roomCode = roomCode;
        this.playerId = playerId;
        this.text = text;
        this.color = color;
        this.system = system != null ? system : false;
    }

    public Boolean getSystem() { return system != null && system;}
    public void setSystem(Boolean system) { this.system = system; }

	public String getRoomCode() {return roomCode;}
	public void setRoomCode(String roomCode) {this.roomCode = roomCode;}

	public String getPlayerId() {return playerId;}

	public void setColor(String color) {this.color = color;}
	public String getColor(){return this.color;}
	
	public String getText() {return text;}

	public void setPlayerId(String playerId) {this.playerId = playerId;}
	public void setText(String text) {this.text = text;}
}