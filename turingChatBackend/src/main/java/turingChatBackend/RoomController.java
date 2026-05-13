package turingChatBackend;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

//Handles HTTP endpoints for creating, joining, starting, and retrieving game rooms, delegating all logic to RoomService.
@RestController
@RequestMapping("/room")
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @RequestMapping(value = "/**", method = RequestMethod.OPTIONS)
    public ResponseEntity<?> handleOptions() {
        return ResponseEntity.ok().build();
    }

    //create room
    @PostMapping("/create")
    public ResponseEntity<Room> createRoom(@RequestBody String adminId) {

        String cleanAdminId = normalize(adminId);
        System.out.println(cleanAdminId + " is creating a room");
        Room room = roomService.createRoom(cleanAdminId);
        return ResponseEntity.ok(room);
    }

    //join existing room with code
    @PostMapping("/join/{roomCode}")
    public ResponseEntity<Room> joinRoom(
            @PathVariable String roomCode,
            @RequestParam String playerId
    ) {
        return ResponseEntity.ok(
                roomService.joinRoom(roomCode, normalize(playerId))
        );
    }

    //join quick join room, create one if there isnt an open one
    @PostMapping("/quickjoin")
    public ResponseEntity<Room> quickJoinRoom(@RequestBody String playerId) {
        Room room = roomService.quickJoin(normalize(playerId));
        return ResponseEntity.ok(room);
    }
    
    //join game via invite link
    @GetMapping("/invite/{roomCode}")
    public ResponseEntity<Room> joinByInvite(
            @PathVariable String roomCode,
            @RequestParam String playerId
    ) {
        return ResponseEntity.ok(
                roomService.joinRoom(roomCode, normalize(playerId))
        );
    }
    //send all players in room game is starting
    @PostMapping("/start/{roomCode}")
    public ResponseEntity<Room> startGame(
            @PathVariable String roomCode,
            @RequestParam String playerId) {
        return ResponseEntity.ok(
                roomService.startGame(roomCode, normalize(playerId)));
    }
    //reset game with same players
    @PostMapping("/reset/{roomCode}")
    public ResponseEntity<Room> resetRoom(@PathVariable String roomCode) {
        return ResponseEntity.ok(
                roomService.resetRoom(roomCode)
        );
    }
    //get room object based on roomcode
    @GetMapping("/{roomCode}")
    public ResponseEntity<Room> getRoom(@PathVariable String roomCode) {
        return ResponseEntity.ok(roomService.getRoom(roomCode));
    }

    //normalize id string that we get from frontend
    private String normalize(String id) {
        if (id == null) return null;

        id = id.trim();
        if (id.startsWith("{")) {
            try {
                return id.substring(id.indexOf(":\"") + 2, id.lastIndexOf("\""));
            } catch (Exception e) {
                return id;
            }
        }
        return id;
    }
    
}