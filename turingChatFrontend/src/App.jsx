//Controls and handles the entire frontend game flow
import { useState, useEffect, useRef } from "react";

import StartScreen from "./screens/StartScreen";
import LobbyScreen from "./screens/LobbyScreen";
import WaitingScreen from "./screens/WaitingScreen";
import GameScreen from "./screens/GameScreen";
import VotingScreen from "./screens/VotingScreen";
import EndScreen from "./screens/EndScreen";
import StartGameCountdownScreen from "./screens/StartGameCountdownScreen";
import ContactScreen from "./screens/ContactScreen";

import { getOrCreatePlayerId } from "./utils/player";
import { connectToRoom, disconnect } from "./websocket";

function App() {
    // Current screen being displayed
    const [screen, setScreen] = useState("START");
    // Current room data from backend
    const [room, setRoom] = useState(null);
    // Game timer state
    const [timer, setTimer] = useState(null);
    // Chat messages for current game
    const [chat, setChat] = useState([]);
    // The player this user voted for
    const [myVote, setMyVote] = useState(null);
    // Light / dark theme
    const [theme, setTheme] = useState("dark");
    // Persistent local player ID
    const playerId = getOrCreatePlayerId();
    // Invite code from URL (/invite/XXXX)
    const inviteCode = window.location.pathname.split("/")[2];
    // Prevents countdown from triggering multiple times
    const countdownStartedRef = useRef(false);
    // Prevents duplicate invite joins
    const didJoinRef = useRef(false);
    // Tracks currently connected websocket room
    const connectedRoomRef = useRef(null);
    // Prevents processing the same game twice
    const lastGameIdRef = useRef(null);
    // Tracks websocket initialization state
    const wsInitializedRef = useRef(false);

    // handle theme
    useEffect(() => {
        const saved = localStorage.getItem("theme") || "dark";
        setTheme(saved);
    }, []);
    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
    }, [theme]);

    // Screen switching handler
    useEffect(() => {
        if (!room) return;

        switch (room.status) {
            case "WAITING":
                setChat([]);
                countdownStartedRef.current = false; //reset lock
                setScreen("WAITING");
                break;

            case "IN_GAME": {
                const gameId = room.gameId || room.gameStartTime;

                // if already processed this game, ignore everything
                if (lastGameIdRef.current === gameId && countdownStartedRef.current) return;

                lastGameIdRef.current = gameId;
                countdownStartedRef.current = true;
                setScreen("COUNTDOWN");
                break;
            }

            case "VOTING":
                setScreen("VOTING");
                break;

            case "END":
                countdownStartedRef.current = false; // reset lock
                setScreen("END");
                break;
        }
    }, [room]);

    // Cleanup on room reset
    useEffect(() => {
        if (!room) {
            setChat([]);
            setTimer(null);
            setMyVote(null);
            lastGameIdRef.current = null;
        }
    }, [room]);

    // Handles connecting to the room websocket
    useEffect(() => {
        if (!room?.roomCode || !playerId) return;

        // prevent duplicate websocket initialization
        if (connectedRoomRef.current === room.roomCode) return;
        connectedRoomRef.current = room.roomCode;

        connectToRoom(
            room.roomCode,
            playerId,
            (updatedRoom) => {
                setRoom(updatedRoom);
            },
            (msg) => {
                setChat(prev => [...prev, msg]);
            }
        );

        //returns and disconnects when component unmounts or room changes
        return () => {
            disconnect();
            connectedRoomRef.current = null;
            wsInitializedRef.current = false;
        };
    }, [room?.roomCode, playerId]);

    // Handles user joining via invite link
    useEffect(() => {
        if (!inviteCode || didJoinRef.current) return;

        didJoinRef.current = true;

        fetch(
            `${import.meta.env.VITE_API_BASE_URL}/room/invite/${inviteCode}?playerId=${playerId}`
        )
            .then(res => res.json())
            .then(joinedRoom => {
                setRoom(joinedRoom);
                setScreen("WAITING");
            })
            .catch(err => {
                console.error("Invite failed:", err);
                setScreen("START");
            });

    }, [inviteCode]);

    //screen state handler
    return (
        <>
            {screen === "START" && (
                <StartScreen setScreen={setScreen} setTheme={setTheme} />
            )}

            {screen === "CONTACT" && (
                <ContactScreen setScreen={setScreen} setTheme={setTheme} />
            )}

            {screen === "LOBBY" && (
                <LobbyScreen
                    playerId={playerId}
                    setRoom={setRoom}
                    setScreen={setScreen}
                    setTheme={setTheme}
                />
            )}

            {screen === "WAITING" && room && (
                <WaitingScreen
                    room={room}
                    playerId={playerId}
                    setRoom={setRoom}
                    setScreen={setScreen}
                    setTheme={setTheme}
                />
            )}

            {screen === "COUNTDOWN" && room && (
                <StartGameCountdownScreen
                    room={room}
                    setRoom={setRoom}
                    setScreen={setScreen}
                    setTheme={setTheme}
                />
            )}

            {screen === "GAME" && room && (
                <GameScreen
                    room={room}
                    playerId={playerId}
                    setRoom={setRoom}
                    timer={timer}
                    setTimer={setTimer}
                    setScreen={setScreen}
                    chat={chat}
                    setChat={setChat}
                    setTheme={setTheme}
                />
            )}

            {screen === "VOTING" && room && (
                <VotingScreen
                    room={room}
                    playerId={playerId}
                    chat={chat}
                    setMyVote={setMyVote}
                    setTheme={setTheme}
                />
            )}

            {screen === "END" && room && (
                <EndScreen
                    room={room}
                    setRoom={setRoom}
                    setScreen={setScreen}
                    myVote={myVote}
                    setMyVote={setMyVote}
                    chat={chat}
                    setChat={setChat}
                    setTheme={setTheme}
                />
            )}
        </>
    );
}

export default App;