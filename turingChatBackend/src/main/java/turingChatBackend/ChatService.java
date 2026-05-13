package turingChatBackend;

import org.springframework.stereotype.Service;

//Handles saving chat messages to a room by formatting them and persisting them in the repository.
@Service
public class ChatService {

    private final RoomRepository roomRepository;

    public ChatService(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    //handle saving messages to repository and room
    public void addMessage(String roomCode, String color, String text) {

        Room room = roomRepository.findByRoomCode(roomCode).orElse(null);
        if (room == null) return;

        String formatted = color + ": " + text;

        room.addChatMessage(formatted);
        roomRepository.save(room);

        System.out.println("Saved message: " + formatted);
    }
}