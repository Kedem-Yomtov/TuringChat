package turingChatBackend;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

//Receives vote requests from the frontend and forwards them to VoteService for processing and storage.
@RestController
@RequestMapping("/api")
public class VoteController {

    private final VoteService voteService;
    private final RoomService roomService;

    public VoteController(VoteService voteService, RoomService roomService) {
        this.voteService = voteService;
        this.roomService = roomService;
    }

    @PostMapping("/vote")
    public void vote(@RequestBody VoteRequest req) {

        // mark player as online when they interact
        roomService.setPlayerOnline(req.getRoomCode(), req.getVoterId(), true);

        voteService.submitVote(
                req.getRoomCode(),
                req.getVoterId(),
                req.getTargetColor()
        );
    }
}