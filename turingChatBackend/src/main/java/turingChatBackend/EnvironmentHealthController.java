package turingChatBackend;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class EnvironmentHealthController {
    
    @GetMapping("/")
    public String checkEnv() {
        return "Turing Chat Backend Is Active";
    }
}