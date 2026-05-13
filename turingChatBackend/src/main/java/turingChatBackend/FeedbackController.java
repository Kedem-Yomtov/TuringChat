package turingChatBackend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

// Handles getting and processing feedback messages from users
@RestController
@RequestMapping("/feedback")
@CrossOrigin
public class FeedbackController {

    @Autowired
    private FeedbackRepository feedbackRepository;

    // DTO
    public static class FeedbackRequest {
        public String name;
        public String email;
        public String message;
    }

    @PostMapping
    public ResponseEntity<?> receiveFeedback(
            @RequestBody FeedbackRequest request
    ) {

        // basic validation
        if (request.name == null || request.name.trim().isEmpty()) {
            return ResponseEntity
                    .badRequest()
                    .body("Name is required");
        }

        if (request.message == null || request.message.trim().isEmpty()) {
            return ResponseEntity
                    .badRequest()
                    .body("Message is required");
        }

        try {
            Feedback feedback = new Feedback(
                    request.name,
                    request.email,
                    request.message
            );
            feedbackRepository.save(feedback);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity
                    .internalServerError()
                    .body("Failed to save feedback");
        }

        return ResponseEntity.ok("Feedback saved");
    }
}