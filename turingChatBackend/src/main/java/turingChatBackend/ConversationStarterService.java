package turingChatBackend;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Random;

@Service
public class ConversationStarterService {

    private final List<String> starters = List.of(

        "Coffee, Tea, or Energy drinks?",
        "Morning person or night owl?",
        "Sweet or salty snacks?",
        "Hot weather or cold weather?",
        "Texting or calling?",

        "Dogs or cats?",
        "Shower in the morning or at night?",
        "Pizza or burgers?",
        "Beach or mountains?",
        "Ice cream or chocolate?",

        "Android or iPhone?",
        "PC or console?",
        "Music loud or quiet?",
        "Books or movies?",

        "Early to everything or always late?",
        "Messy room or super clean room?",

        "Be invisible or be able to fly?",
        "Read minds or teleport?",
        "Have unlimited money or unlimited free time?",
        "Never sleep or never eat again?",

        "Always be too hot or too cold?",
        "Never use phone or never use computer?",

        "Describe your mood in one word.",
        "One word: your personality?",
        "One word: your current energy level?",

        "What’s your go-to comfort food?",
        "What song are you playing on repeat lately?",
        "What’s your favorite emoji?",
        "What’s a random skill you’re weirdly good at?",

        "What’s your guilty pleasure snack?",
        "What’s your favorite way to waste time?",
        "What’s something you recently learned?",
        "What’s your “default” drink?",

        "You get a superpower for a day — what is it?",
        "You can delete one chore forever — which one?",
        "You can only eat one food forever — what is it?",
        "You can time travel once — past or future?",

        "You’re stuck in an elevator — who do you want with you?",
        "You win a free trip — where are you going?"
    );

    private final Random random = new Random();

    public String getRandomStarter() {
        return starters.get(random.nextInt(starters.size()));
    }

    public List<String> getAllStarters() {
        return starters;
    }
}