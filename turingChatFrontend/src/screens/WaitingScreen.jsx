import { useState, useEffect } from "react";
import { startGame } from "../api/roomApi";

export default function WaitingScreen({
    room,
    playerId,
    setTheme
}) {

    //handle showing invite link
    const [showInvite, setShowInvite] = useState(false);
    //get list of players in room
    const players =
        room?.players?.filter(p => p.online && !p.bot) || [];

    const normalizePlayerId = (p) => {
        if (!p?.playerId) return null;
        try {
            return JSON.parse(p.playerId).playerId;
        } catch {
            return p.playerId;
        }
    };

    const myPlayer = players.find(
        p => normalizePlayerId(p) === playerId
    );

    const isAdmin = myPlayer?.admin === true;
    const canStart = players.length >= 2; //recommend only let player start from 2 or more

    const [displayText, setDisplayText] = useState("");
    const [typingIndex, setTypingIndex] = useState(0);

    async function handleStartGame() {
        if (!isAdmin) return;

        try {
            await startGame(room.roomCode, playerId);
        } catch (err) {
            console.error(err);
        }
    }

    //invite link to send people to join the room
    const inviteLink =
        `${window.location.origin}/invite/${room?.roomCode}`;

    function copyInvite() {
        navigator.clipboard.writeText(inviteLink);
    }

    // Waiting room rotating messages
    const lobbyMessages = [
        "Calibrating trust levels between players...",
        "Analyzing micro-suspicious behavior patterns...",
        "Measuring how fast people lie in chat...",
        "Detecting emotional instability in real time...",
        "Scanning for overconfident behavior...",
        "Building fake personality profiles for everyone...",
        "Assigning subtle paranoia to each player...",
        "Teaching AI how to lie more convincingly...",
        "Teaching humans how to *not* lie convincingly...",
        "Deciding who looks the most suspicious (scientifically)...",
        "Preloading betrayal algorithms...",
        "Simulating awkward accusations phase...",
        "Preparing emotional damage module...",
        "Loading 'I swear it's not me' responses...",
        "Optimizing chaos per second...",
        "Spawning unnecessary drama (for realism)...",
        "Injecting mild confusion into the server...",
        "Stirring the pot slowly...",
        "Almost ready to ruin friendships...",
        "Finalizing dramatic pause timing...",
        "Loading suspense...",
        "Everyone is innocent until proven annoying.",

        "Fun fact: Alan Turing was a British mathematician and computer scientist, widely considered one of the fathers of modern computing.",
        "Fun fact: During World War II, Alan Turing worked at Bletchley Park, where he helped break the German Enigma code.",
        "Fun fact: Turing designed an early electromechanical machine called the Bombe to help decrypt encrypted messages.",
        "Fun fact: The concept of the Turing Machine, proposed in 1936, became a foundational model of computation in computer science.",
        "Fun fact: Alan Turing introduced the idea of a test for machine intelligence, now known as the Turing Test.",
        "Fun fact: Alan Turing's work at Bletchley Park is estimated to have significantly shortened World War II by helping decode German communications.",
        "Fun fact: Alan Turing studied mathematics at King’s College, Cambridge.",
        "Fun fact: Alan Turing published a paper in 1936 that introduced the idea of a universal machine capable of simulating any algorithm.",
        "Fun fact: Turing worked on early concepts of artificial intelligence and biological pattern formation.",
        "Fun fact: In 1952, Alan Turing was prosecuted for homosexuality, which was illegal in the UK at the time.",
        "Fun fact: Alan Turing was posthumously pardoned by the British government in 2013.",
        "Fun fact: The annual Turing Award is one of the highest honors in computer science, often called the “Nobel Prize of computing.”",
        "Fun fact: Alan Turing’s work laid the theoretical foundations for modern digital computers.",
    ];

    const [shuffledMessages, setShuffledMessages] = useState(() =>
        shuffle(lobbyMessages)
    );

    const [lobbyTipIndex, setLobbyTipIndex] = useState(0);
    useEffect(() => {
        setDisplayText("");
        setTypingIndex(0);
    }, [lobbyTipIndex]);

    //handle printing funny waiting messages
    useEffect(() => {
        const currentMessage = shuffledMessages[lobbyTipIndex];
        if (!currentMessage) return;

        if (typingIndex >= currentMessage.length) return;

        const timeout = setTimeout(() => {
            setDisplayText(prev => prev + currentMessage[typingIndex]);
            setTypingIndex(prev => prev + 1);
        }, 55); // speed (lower = faster)

        return () => clearTimeout(timeout);
    }, [typingIndex, lobbyTipIndex, shuffledMessages]);
    
    //handle toggling funny waiting messages
    useEffect(() => {
        const interval = setInterval(() => {
            setLobbyTipIndex(prev => {
                const next = prev + 1;

                if (next >= shuffledMessages.length) {
                    setShuffledMessages(shuffle(lobbyMessages));
                    return 0;
                }
                return next;
            });
        }, 15000); // sets waiting time between message rotations
        return () => clearInterval(interval);
    }, [])
    return (
        <div style={styles.page}>

            {/* Theme Toggle */}
            <button
                onClick={() =>
                    setTheme(prev => prev === "dark" ? "light" : "dark")
                }
                style={styles.themeToggle}
            >
                🌓
            </button>

            {/* Background */}
            <div style={styles.bg}>
                <div style={{ ...styles.blob, top: "10%", left: "15%", background: "#4f46e5" }} />
                <div style={{ ...styles.blob, top: "60%", left: "20%", background: "#22d3ee" }} />
                <div style={{ ...styles.blob, top: "30%", left: "70%", background: "#a855f7" }} />
                <div style={{ ...styles.blob, top: "75%", left: "75%", background: "#3b82f6" }} />
            </div>

            {/* Card */}
            <div style={styles.card}>
                <h2 style={{ marginBottom: 6 }}>Waiting Room</h2>

                <div style={styles.badge}>
                    {room?.roomCode}
                </div>

                <p style={{ opacity: 0.8, marginBottom: 10 }}>
                    Waiting for players to join...
                </p>

                {/* CHanging Lobby Message */}
                <div style={styles.lobbyTip}>
                    {displayText}
                </div>

                <div style={styles.countBox}>
                    👥 <b>{players.length}</b> player{players.length !== 1 && "s"} connected
                </div>

                <div style={styles.role}>
                    You are{" "}
                    <b style={{ color: myPlayer?.color || "var(--text-h)" }}>
                        {myPlayer?.color || "UNKNOWN"}
                    </b>
                    {isAdmin && " 👑"}
                </div>

                {/* Invite Button */}
                <button
                    onClick={() => setShowInvite(v => !v)}
                    style={{
                        ...styles.button,
                        marginBottom: 10,
                        opacity: 0.9,
                        cursor: "pointer"
                    }}
                >
                    Invite Friends
                </button>

                {/* Invite Panel */}
                {showInvite && (
                    <div style={styles.inviteBox}>
                        <div style={styles.inviteLink}>
                            {inviteLink}
                        </div>

                        <button
                            onClick={copyInvite}
                            style={styles.copyButton}
                        >
                            Copy Link
                        </button>
                    </div>
                )}
                {/* if user is admin add start game option */}
                {isAdmin && (
                    <button
                        onClick={handleStartGame}
                        style={{
                            ...styles.button,
                            cursor: "pointer"
                        }}
                    >
                        {canStart
                            ? "Start Game"
                            : "Start Game (1 player)"}
                    </button>
                )}
            </div>
        </div>
    );
}

//array shuffling function
function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Styles
const styles = {
    page: {
        height: "100dvh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "var(--bg)",
        fontFamily: "sans-serif",
        color: "var(--text-h)",
        padding: 16,
        position: "relative",
        overflow: "hidden"
    },

    bg: {
        position: "absolute",
        inset: 0,
        zIndex: 0
    },

    blob: {
        position: "absolute",
        width: 260,
        height: 260,
        borderRadius: "50%",
        filter: "blur(90px)",
        opacity: 0.5
    },

    card: {
        position: "relative",
        zIndex: 2,
        background: "var(--code-bg)",
        padding: 30,
        borderRadius: 22,
        width: 380,
        boxShadow: "var(--shadow)",
        textAlign: "center",
        backdropFilter: "blur(12px)"
    },

    badge: {
        display: "inline-block",
        background: "var(--border)",
        padding: "6px 12px",
        borderRadius: 999,
        marginBottom: 15,
        fontSize: 14,
        letterSpacing: 2
    },

    countBox: {
        background: "var(--border)",
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
        fontSize: 18
    },

    role: {
        marginBottom: 20,
        fontSize: 14,
        opacity: 0.9
    },

    button: {
        width: "100%",
        fontSize: 16,
        padding: "12px",
        borderRadius: 12,
        border: "none",
        background: "var(--accent)",
        color: "white",
        fontWeight: "bold"
    },

    themeToggle: {
        position: "absolute",
        top: 12,
        right: 12,
        zIndex: 10,
        width: 42,
        height: 42,
        borderRadius: 12,
        border: "none",
        cursor: "pointer",
        background: "var(--code-bg)",
        color: "var(--text-h)",
        fontSize: 18
    },

    inviteBox: {
        background: "var(--border)",
        padding: 12,
        borderRadius: 12,
        marginBottom: 10
    },

    inviteLink: {
        fontSize: 12,
        wordBreak: "break-all",
        marginBottom: 8
    },

    copyButton: {
        width: "100%",
        padding: 10,
        borderRadius: 10,
        border: "none",
        background: "var(--accent)",
        color: "white",
        fontWeight: "bold",
        cursor: "pointer"
    },

    // NEW (minimal addition only)
    lobbyTip: {
        fontSize: 12,
        opacity: 0.65,
        marginBottom: 18,
        fontStyle: "italic",
        transition: "opacity 0.4s ease"
    }
};