package turingChatBackend;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;

import java.util.*;
import java.util.stream.Collectors;

//Represents chatroom object
@Entity
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String roomCode;
    private String status;
    private Long gameEndTime;
    
    @Column(length = 10000)
    private String chatHistory = "";
    
    @Transient
    private Map<String, Object> endResult;

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Player> players = new ArrayList<>();

    private static final List<String> ALL_COLORS = List.of(
            "RED", "BLUE", "GREEN", "YELLOW", "PURPLE", "ORANGE"
    );

    public Room() {}

    public Room(String roomCode) {
        this.roomCode = roomCode;
        this.status = "WAITING";
    }
  

    //return set of colors currently in use
    private Set<String> getUsedColors() {
        return players.stream()
                .map(Player::getColor)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
    }

    private static final Random RANDOM = new Random();

    //set color to player and mark color as taken
    private String assignColor() {
        Set<String> used = getUsedColors();
        List<String> available = ALL_COLORS.stream()
                .filter(c -> !used.contains(c))
                .toList();

        if (available.isEmpty()) {
            throw new RuntimeException("Room full");
        }

        return available.get(RANDOM.nextInt(available.size()));
    }

    //add player to room
    public synchronized Player addPlayer(String playerId, boolean admin) {

        String color = assignColor();
        Player player = new Player();
        player.setPlayerId(playerId);
        player.setColor(color);
        player.setAdmin(admin);
        player.setRoom(this);
        player.setOnline(true);
        players.add(player);

        
        return player;
    }

    //remove player from room
    public synchronized void removePlayer(String playerId) {

        Player target = players.stream()
                .filter(p -> p.getPlayerId().equals(playerId))
                .findFirst()
                .orElse(null);

        if (target == null) return;

        players.remove(target);
    }

    //returns true if room is full, leaves room for AI agent
    public boolean isFull() {
        return players.size() >= ALL_COLORS.size()-1;
    }

    // Getters/Setters
    public Long getEndTime(){return gameEndTime;}
    public void setEndTime(Long gameEndTime) {this.gameEndTime = gameEndTime; }
    public Long getId() { return id;}
    public String getRoomCode() {   return roomCode;}
    public String getStatus() { return status; }
    public void setStatus(String status) {   this.status = status; }
    public List<Player> getPlayers() {return players;}
    public void setPlayers(List<Player> players) {
        this.players.clear();
        this.players.addAll(players);
    }    public Map<String, Object> getEndResult() {return endResult; }
    public void setEndResult(Map<String, Object> endResult) {  this.endResult = endResult;}
    public String getChatHistory() {return chatHistory; }
    public void setChatHistory(String chatHistory) { this.chatHistory = chatHistory;}
    
    //add chat message to message history
    public synchronized void addChatMessage(String msg) {
        if (this.chatHistory == null || this.chatHistory.isBlank()) {
            this.chatHistory = msg;
        } else {
            this.chatHistory = this.chatHistory + "\n" + msg;
        }
    }
    
    public synchronized void resetForNewRound() {

        // reset room state
        this.status = "WAITING";
        this.gameEndTime = null;
        this.endResult = null;
        this.chatHistory = "";

        players.removeIf(Player::isBot);
        /*
        // SAFE iteration (no stream, no modification during traversal issues)
        for (int i = 0; i < players.size(); i++) {
            Player p = players.get(i);
            p.setOnline(true);
            
        }*/
        reassignAllColors();
    }
    
    
    private void reassignAllColors() {
        List<String> shuffled = new ArrayList<>(ALL_COLORS);
        Collections.shuffle(shuffled);

        for (int i = 0; i < players.size(); i++) {
            players.get(i).setColor(shuffled.get(i % shuffled.size()));
        }
    }
   
    
  
    
    
    
}