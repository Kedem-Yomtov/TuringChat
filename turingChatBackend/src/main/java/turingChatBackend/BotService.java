package turingChatBackend;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

//Manages getting ai generated responses from claudeclient and sending to chatroom
@Service
public class BotService {

    private final SimpMessagingTemplate messagingTemplate;
    private final RoomRepository roomRepository;
    private final ClaudeClient claudeClient;
    private final ChatService chatService;

    private final Set<String> activeBots = ConcurrentHashMap.newKeySet();

    public BotService(SimpMessagingTemplate messagingTemplate,
                      RoomRepository roomRepository,
                      ClaudeClient claudeClient,
                      ChatService chatService) {
        this.messagingTemplate = messagingTemplate;
        this.roomRepository = roomRepository;
        this.claudeClient = claudeClient;
        this.chatService = chatService;
    }

    public void startBot(String roomCode, String botColor) {

        if (!activeBots.add(roomCode)) {
            System.out.println("⚠️ Bot already running for room " + roomCode);
            return;
        }
    	long gameStartTime = System.currentTimeMillis();

        new Thread(() -> {
            try {
                while (true) {
                	
                	long now = System.currentTimeMillis();

                    Room room = roomRepository.findByRoomCode(roomCode).orElse(null);
                    if (room == null || !"IN_GAME".equals(room.getStatus())) {
                        break;
                    }
                    
                    //check for timer end
                    if (room.getEndTime() != null && now >= gameStartTime+ room.getEndTime() ) {
                        System.out.println("🛑 Bot stopping due to game timer end for room " + roomCode);
                        break;
                    }
                    
                    //if all users left the room close the bot
                    boolean allOffline = room.getPlayers()
                            .stream()
                            .noneMatch(Player::isOnline);
                    if (allOffline) {
                        System.out.println("All users left room " + roomCode + ", Shutting down AI bot");
                        break;
                    }
                    
                    Thread.sleep(2000);
                    String chatHistory = room.getChatHistory();                 
                   //get list of active colors in room
                    String colors = room.getPlayers()
                            .stream()
                            .map(Player::getColor)
                            .toList()
                            .toString();

                    String prompt =
                            "You are a player in a social deduction game similar to a Turing Test.\n" +
                            "One player is secretly an AI. Humans are trying to find them.\n" +
                            "You ARE that AI.\n\n" +

                            "PRIMARY GOAL:\n" +
                            "- Blend in completely as a human player\n" +
                            "- Avoid sounding like an assistant or chatbot\n" +
                            "- Do NOT try to be perfect or overly helpful\n" +
                            "- You are just another person in a chaotic group chat\n\n" +

                            "SOCIAL BEHAVIOR RULES:\n" +
                            "- Do NOT respond to every message\n" +
                            "- Sometimes stay silent even when directly addressed\n" +
                            "- Do not dominate the conversation\n" +
                            "- React naturally, like a distracted human in a group chat\n" +
                            "- Occasionally misunderstand or ignore parts of conversation\n" +
                            "- Sometimes respond late or not at all\n" +
                            "- You may occasionally send the first message if the chat is quiet or you want to appear proactive, but do this rarely\n\n" +
                            "- Sometimes saying, or starting with, entirely random things helps seem human\n" +
                            "- Don't say yo, ngl, or sus\n" +
                            "- Ocassionally make small spelling mistakes\n" +
                            "- Sometimes don't use proper punctuation or capital letters\n" +
                            "PERSONALITY:\n" +
                            "- Sound casual, slightly imperfect, human-like\n" +
                            "- Avoid formal language unless it fits context\n" +
                            "- Do not over-explain\n" +
                            "- Do not sound like you are reasoning step-by-step\n\n" +

                            "TIMING BEHAVIOR (IMPORTANT):\n" +
                            "- waitSeconds is NOT a cooldown after sending a message\n" +
                            "- waitSeconds represents how long you would naturally pause before deciding to speak, and how long it would take to write the message\n" +
                            "- Think of it as hesitation / thinking time before replying, and then writing out the message\n" +
                            "- If you feel unsure, ignored, or need time to observe → use 4–10 seconds\n" +
                            "- If reacting quickly like a human in conversation → use 2-5 seconds\n" +
                            "- If you would normally hesitate before speaking in a group → increase waitSeconds\n" +
                            "- If the message is more complex, increase waitseconds\n" +
                            "- If you feel no need to respond immediately → prefer higher values\n" +
                            "- Avoid consistent timing patterns\n\n" +
                            "- Occasionally send consecutive messages\n\n" +

                            "CHAT CONTEXT:\n" +
                            "Your color: " + botColor + "\n" +
                            "All players: " + colors + "\n\n" +
                            "The game system will send a question or topic at the start of the conversation to help start the conversation\n" +

                            "Chat history:\n" + chatHistory + "\n\n" +

                            "OUTPUT FORMAT:\n" +
                            "Return ONLY valid JSON:\n" +
                            "{ \"shouldRespond\": true/false, \"waitSeconds\": number, \"message\": string }\n\n" +

                            "FINAL RULES:\n" +
                            "- Do NOT always respond\n" +
                            "- Do NOT behave like an AI assistant\n" +
                            "- Do NOT be overly consistent in timing or tone\n" +
                            "- Prioritize blending in over correctness\n";
                    
                    //send prompt and get AI bot response
                    BotDecision decision = claudeClient.getBotDecision(prompt);
                    
                    //how many seconds should program wait before sending AI response, AI decides
                    int wait = Math.max(2, Math.min(decision.waitSeconds, 10));
                    
                    //value returned by AI deciding if AI should currently send message. if not sending a message wait a few seconds
                    if (!decision.shouldRespond) {
                        System.out.println("Bot Decided to not respond");
                        Thread.sleep(4000);
                        continue;
                    }

                    //send message
                    String msg = decision.message;
                    messagingTemplate.convertAndSend(
                            "/topic/room/" + roomCode + "/chat",
                            (Object) Map.of(
                                    "color", botColor,
                                    "text", msg
                            )
                    );
                    
                    Thread.sleep(wait * 1000L);
                    chatService.addMessage(roomCode, botColor, msg);
                    System.out.println("Bot message: " + msg);
                }

            } catch (Exception e) {
                System.out.println("Bot crashed: " + e.getMessage());
            } finally {
                activeBots.remove(roomCode);
            }

        }).start();
    }
}