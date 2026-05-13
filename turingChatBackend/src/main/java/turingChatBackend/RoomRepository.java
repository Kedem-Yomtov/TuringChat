package turingChatBackend;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

//Spring Data JPA repository for Room entities
public interface RoomRepository extends JpaRepository<Room, Long> {

    @EntityGraph(attributePaths = {"players"})
    Optional<Room> findByRoomCode(String roomCode);
}