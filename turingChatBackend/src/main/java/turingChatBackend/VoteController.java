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

    public VoteController(VoteService voteService) {
        this.voteService = voteService;
    }

    @PostMapping("/vote")
    public void vote(@RequestBody VoteRequest req) {
        voteService.submitVote(
                req.getRoomCode(),
                req.getVoterId(),
                req.getTargetColor()
        );
    }
    
    
}