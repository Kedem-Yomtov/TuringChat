package turingChatBackend;
import org.springframework.stereotype.Service;
import java.util.List;

//Assigns a unique available color to a player in a room by choosing from a predefined list of unused colors.
@Service
public class ColorService {

    private static final List<String> COLORS = List.of(
            "RED", "BLUE", "GREEN", "YELLOW", "PURPLE", "ORANGE"
    );

    public String assignColor(Room room) {
        return COLORS.stream()
                .filter(c -> room.getPlayers()
                        .stream()
                        .noneMatch(p -> p.getColor().equals(c)))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No colors left"));
    }
}