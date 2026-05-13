package turingChatBackend;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface VoteRepository extends JpaRepository<Vote, Long> {

    List<Vote> findByRoomCode(String roomCode);
    Optional<Vote> findByRoomCodeAndVoterId(String roomCode, String voterId);
    void deleteByRoomCode(String roomCode);
}