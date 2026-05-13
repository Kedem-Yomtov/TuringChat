package turingChatBackend;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

//Handles vote logic including submitting, updating, counting, retrieving, and clearing votes for a room using the repository.
@Service
public class VoteService {

    private final VoteRepository voteRepository;

    public VoteService(VoteRepository voteRepository) {
        this.voteRepository = voteRepository;
    }

    public void submitVote(String roomCode, String voterId, String targetColor) {

        voteRepository.findByRoomCodeAndVoterId(roomCode, voterId)
                .ifPresent(voteRepository::delete);
        voteRepository.save(new Vote(roomCode, voterId, targetColor));
    }

    public Map<String, Long> countVotes(String roomCode) {
        return voteRepository.findByRoomCode(roomCode)
                .stream()
                .collect(Collectors.groupingBy(
                        Vote::getTargetColor,
                        Collectors.counting()
                ));
    }

    public List<Vote> getVotes(String roomCode) {
        return voteRepository.findByRoomCode(roomCode);
    }

    @Transactional
    public void clearVotes(String roomCode) {
        voteRepository.deleteByRoomCode(roomCode);
    }
}