package turingChatBackend;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

//Represents players end of game vote
@Entity
public class Vote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String roomCode;
    private String voterId;
    private String targetColor;

    public Vote() {}

    public Vote(String roomCode, String voterId, String targetColor) {
        this.roomCode = roomCode;
        this.voterId = voterId;
        this.targetColor = targetColor;
    }

    public String getRoomCode() { return roomCode; }
    public String getVoterId() { return voterId; }
    public String getTargetColor() { return targetColor; }
}