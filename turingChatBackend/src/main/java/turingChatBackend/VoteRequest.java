package turingChatBackend;

//DTO used to receive vote submissions from the frontend
public class VoteRequest {

    private String roomCode;
    private String voterId;
    private String targetColor;

    public VoteRequest() {}

    public String getRoomCode() {return roomCode;}
    public void setRoomCode(String roomCode) {this.roomCode = roomCode; }

    public String getVoterId() {  return voterId; }
    public void setVoterId(String voterId) { this.voterId = voterId;}
    
    public String getTargetColor() { return targetColor; }
    public void setTargetColor(String targetColor) { this.targetColor = targetColor; }
}