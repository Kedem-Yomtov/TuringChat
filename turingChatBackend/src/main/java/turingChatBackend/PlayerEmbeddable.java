package turingChatBackend;
import java.util.Objects;

import jakarta.persistence.Embeddable;

//Embeddable JPA object representing a player inside a room,
@Embeddable
public class PlayerEmbeddable {

    private String playerId;
    private String color;
    private boolean admin;

    public PlayerEmbeddable() {}

    public PlayerEmbeddable(String playerId, String color, boolean admin) {
        this.playerId = playerId;
        this.color = color;
        this.admin = admin;
    }

    public String getPlayerId() { return playerId;  }
    public String getColor() { return color;  }
    public boolean isAdmin() {  return admin; }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PlayerEmbeddable)) return false;
        PlayerEmbeddable that = (PlayerEmbeddable) o;
        return Objects.equals(playerId, that.playerId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(playerId);
    }
}