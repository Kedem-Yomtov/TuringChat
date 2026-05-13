package turingChatBackend;

import jakarta.persistence.*;
import java.time.LocalDateTime;

//represents a feedback message
@Entity
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String email;

    @Column(length = 5000)
    private String message;

    private LocalDateTime createdAt;

    public Feedback() {}

    public Feedback(
            String name,
            String email,
            String message
    ) {
        this.name = name;
        this.email = email;
        this.message = message;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getMessage() {
        return message;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}