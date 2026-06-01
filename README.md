# TuringChat

TuringChat is a real-time multiplayer social deduction game where players chat in a room while one hidden AI tries to blend in. Players must communicate, analyze behavior, and vote on who they believe the AI is.

The game combines live chat, WebSockets, AI-generated responses (Claude API), and a full game lifecycle including lobby, gameplay, voting, and results.

---

## Features

- Real-time multiplayer chat (WebSockets)
- Hidden AI player using Claude API
- Room system (create / join / invite links)
- Game phases: Lobby → Countdown → Game → Voting → Results
- Player color identity system
- Live voting system
- End-game analytics and chat replay
- Feedback system
- Theme support (light/dark mode)

---

## Tech Stack

### Backend
- Java 21 + Spring Boot
- Spring WebSocket (STOMP)
- Spring Data JPA
- PostgreSQL
- Hibernate ORM
- Claude API integration

### Frontend
- React (Vite)
- JavaScript (ES6+)
- WebSocket client (@stomp/stompjs + SockJS)
- CSS variables for theming

---

## Project Structure

### Backend Overview

**Main Application**
- `TuringChatBackendApplication` – Spring Boot entry point

**Core Game Logic**
- `Room`, `Player`, `Vote`, `ChatMessage` – core game entities
- `RoomService`, `VoteService`, `ChatService` – business logic layer
- `ColorService` – assigns unique player colors
- `ConversationStarterService` – generates prompts for players

**AI System**
- `BotService` – manages AI behavior
- `ClaudeClient` – communicates with Claude API
- `BotDecision` – structured AI response model

**Controllers**
- `RoomController` – room lifecycle (create/join/start)
- `ChatController` – chat handling
- `VoteController` – voting system
- `FeedbackController` – user feedback

**WebSocket Layer**
- `WebSocketController` – real-time messaging
- `WebSocketConfig` – WebSocket setup
- `WebSocketEventListener` – connect/disconnect events
- `SessionRegistry` – session tracking

**Data Layer**
- `RoomRepository`
- `VoteRepository`
- `FeedbackRepository`

**DTOs / Models**
- `RoomDTO`, `PlayerDTO`, `VoteRequest`, `RegisterMessage`, `TimerEvent`

**Infrastructure**
- `SecurityConfig` – disables auth, configures CORS

---

### Frontend Overview

**Core App**
- `App.jsx` – central game state machine controlling all screens

**API Layer**
- `RoomAPI.js` – room actions
- `VoteAPI.js` – voting requests
- `WebSocket.js` – real-time communication

**Screens**
- `StartScreen.jsx` – entry screen
- `LobbyScreen.jsx` – room lobby
- `WaitingScreen.jsx` – pre-game waiting room
- `StartGameCountdownScreen.jsx` – countdown before game starts
- `GameScreen.jsx` – main gameplay chat
- `VotingScreen.jsx` – voting phase
- `EndScreen.jsx` – results and summary
- `ContactScreen.jsx` – feedback/contact page

**Utilities**
- `Player.js` – player identity handling
- `index.css` – global theme system
- `App.css` – reusable UI styles

---

## Game Flow

1. Player creates or joins a room
2. Lobby fills with connected players
3. Game starts → countdown phase
4. Players chat in real-time
5. One hidden AI blends in
6. Players vote on who the AI is
7. Results are displayed

---

## AI System

The AI player is powered by Claude API and:
- Generates context-aware responses
- Adapts tone to match human conversation
- Returns structured decisions (`BotDecision`)
- Is injected into chat as a hidden participant

---

## Realtime System

- WebSocket-based communication using STOMP + SockJS
- Rooms broadcast:
  - chat messages
  - player updates
  - game state transitions
  - end results

---

## Setup Instructions

### Backend
```bash
cd backend
mvn spring-boot:run