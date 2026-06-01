package turingChatBackend;

import org.springframework.messaging.handler.annotation.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

//Handles incoming chat messages from players, assigns the correct player color, stores them, and broadcasts them to all clients in the room.
@Controller
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final RoomRepository roomRepository;
    private final ChatService chatService;

    public ChatController(SimpMessagingTemplate messagingTemplate,
                          RoomRepository roomRepository,
                          ChatService chatService) {
        this.messagingTemplate = messagingTemplate;
        this.roomRepository = roomRepository;
        this.chatService = chatService;
    }

    @MessageMapping("/chat/{roomCode}")
    public void handleChat(
            @DestinationVariable String roomCode,
            @Payload ChatMessage msg
    ) {

        System.out.println("chat message to " + roomCode + " - " + msg.getPlayerId() + ": " + msg.getText());

        //get room
        Room room = roomRepository.findByRoomCode(roomCode).orElse(null);
        if (room == null) return;

        //get message sender
        Player sender = room.getPlayers().stream()
                .filter(p -> p.getPlayerId().equals(msg.getPlayerId()))
                .findFirst()
                .orElse(null);
        
        sender.setOnline(true); //verify if we got a message from someone we set them online
        //set message color
        if (sender != null) {
            msg.setColor(sender.getColor());
        } else if (msg.getColor() == null) {
            msg.setColor("gray");
        }

        //handle message
        chatService.addMessage(roomCode, msg.getColor(), msg.getText());

        //send message
        messagingTemplate.convertAndSend(
                "/topic/room/" + roomCode + "/chat",
                msg
        );
    }
}