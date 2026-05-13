package turingChatBackend;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

//Represents a player in a room
@Entity
public class Player {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private boolean online = false;

    @Column(nullable = false)
    private String playerId;

    private String color;

    private boolean admin;
    
    @Column(name = "is_bot")
    private boolean isBot;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id")
    @JsonIgnore
    private Room room;

    public Player() {
    	isBot = false;
    }
    
    public Long getId() {return id;}
    
    public String getPlayerId() {return playerId; }
    public void setPlayerId(String playerId) {this.playerId = playerId;}
    
    public boolean isBot() {return isBot;}
    public void setBot(boolean bot) {isBot = bot;}
    
    public String getColor() { return color;}
    public void setColor(String color) {this.color = color;}
    
    public boolean isAdmin() {return admin;}
    public void setAdmin(boolean admin) {this.admin = admin;}
    
    public Room getRoom() { return room;}
    public void setRoom(Room room) {this.room = room;}

    public boolean isOnline() {return online;}
    public void setOnline(boolean online) {this.online = online;}
}