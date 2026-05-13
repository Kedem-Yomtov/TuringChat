package turingChatBackend;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Controller;

//Handles WebSocket messages for player registration and stores session-to-player/room mappings in SessionRegistry.
@Controller
public class WebSocketController {

    private final SessionRegistry sessionRegistry;

    public WebSocketController(SessionRegistry sessionRegistry) {
        this.sessionRegistry = sessionRegistry;
    }

    @MessageMapping("/register")
    public void register(@Payload RegisterMessage msg,
                         StompHeaderAccessor accessor) {
        String sessionId = accessor.getSessionId();
        sessionRegistry.register(
                sessionId,
                msg.getRoomCode(),
                msg.getPlayerId()
        );
        System.out.println("REGISTERED: " + msg.getPlayerId());
    }
}