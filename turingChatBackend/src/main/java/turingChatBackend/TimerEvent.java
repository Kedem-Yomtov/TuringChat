package turingChatBackend;

//Represents a timer-related event sent to clients
public class TimerEvent {

    private String type; // TIMER_START / TIMER_END
    private String roomCode;
    private long duration;
    private long startedAt;

    public TimerEvent(String type, String roomCode, long duration, long startedAt) {
        this.type = type;
        this.roomCode = roomCode;
        this.duration = duration;
        this.startedAt = startedAt;
    }

    //getters and setters
    public String getType() { return type; }
    public String getRoomCode() { return roomCode; }
    public long getDuration() { return duration; }
    public long getStartedAt() { return startedAt; }
}