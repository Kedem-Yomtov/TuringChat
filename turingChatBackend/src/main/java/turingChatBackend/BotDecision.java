package turingChatBackend;

//Represents the AI bot’s decision for a single response, including the message, waittime and shouldrespond

public class BotDecision {

    public int waitSeconds;
    public String message;
    public boolean shouldRespond;

    public BotDecision() {}

    public BotDecision(int waitSeconds, String message, boolean shouldRespond) {
        this.waitSeconds = waitSeconds;
        this.message = message;
        this.shouldRespond = shouldRespond;
    }

    // backward-compatible constructor
    public BotDecision(int waitSeconds, String message) {
        this.waitSeconds = waitSeconds;
        this.message = message;
        this.shouldRespond = true;
    }
}