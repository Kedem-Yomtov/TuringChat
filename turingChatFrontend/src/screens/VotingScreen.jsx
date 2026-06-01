import { useEffect, useState, useRef } from "react";
import { sendVote } from "../api/voteApi";

export default function VotingScreen({ room, playerId, chat = [], setMyVote }) {
    const [selected, setSelected] = useState(null);
    const [hasVoted, setHasVoted] = useState(false);
    const [timeLeft, setTimeLeft] = useState(120); //set voting countdown time

    const intervalRef = useRef(null);

    // Theme
    const [theme, setTheme] = useState(
        document.documentElement.getAttribute("data-theme") || "dark"
    );
    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
    }, [theme]);

    const players =
        room?.players?.filter(p => p.online || p.bot) || [];

    const normalizePlayerId = (p) => {
        if (!p?.playerId) return null;
        try {
            return JSON.parse(p.playerId).playerId;
        } catch {
            return p.playerId;
        }
    };

    const myPlayer = players.find(
        (p) => normalizePlayerId(p) === playerId
    );

    const myColor = myPlayer?.color;

    useEffect(() => {
        setTimeLeft(120);// set countdown for voting time

        //set timer intervaks
        intervalRef.current = setInterval(() => {
            setTimeLeft((t) => {
                if (t <= 1) {
                    clearInterval(intervalRef.current);
                    return 0;
                }
                return t - 1;
            });
        }, 1000);
        return () => clearInterval(intervalRef.current);
    }, []);

    //handle selecting player to vote for
    function handleSelect(color) {
        if (color === myColor) return;
        if (hasVoted) return;
        setSelected(color);
    }

    async function handleVote() {
        if (!selected || hasVoted) return;

        try {
            await sendVote(room.roomCode, playerId, selected);
            setHasVoted(true);
            setMyVote(selected);
        } catch (err) {
            console.error(err);
        }
    }
    //format time for timer display
    const formatTime = (t) => {
        const m = Math.floor(t / 60);
        const s = t % 60;
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    return (
        <div style={styles.page}>

            {/* Theme Toggle */}
            <button
                onClick={() =>
                    setTheme(prev => (prev === "dark" ? "light" : "dark"))
                }
                style={styles.themeToggle}
            >
                🌓
            </button>

            {/* Background */}
            <div style={styles.bg}>
                <div style={{ ...styles.blob, top: "15%", left: "10%", background: "#4f46e5" }} />
                <div style={{ ...styles.blob, top: "65%", left: "15%", background: "#22d3ee" }} />
                <div style={{ ...styles.blob, top: "35%", left: "75%", background: "#a855f7" }} />
                <div style={{ ...styles.blob, top: "80%", left: "70%", background: "#3b82f6" }} />
            </div>

            <div style={styles.card}>

                {/* Header */}
                <div style={styles.header}>
                    <h1 style={styles.title}>Vote!</h1>
                    <div style={styles.timer}>
                        {formatTime(timeLeft)}
                    </div>
                </div>

                {/* Chat display */}
                <div style={styles.section}>
                    <strong>Chat</strong>

                    <div style={styles.chat}>
                        {chat.map((m, i) => (
                            <div key={i} style={styles.msg}>
                                <b style={{ color: m.color }}>{m.color}:</b> {m.text}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Voting */}
                <div style={{ ...styles.section, flex: 1 }}>
                    <strong>Who is the AI?</strong>

                    <div style={styles.list}>
                        {players.map((p) => {
                            const color = p.color;
                            const isMe = color === myColor;

                            return (
                                <div
                                    key={p.playerId}
                                    onClick={() => handleSelect(color)}
                                    style={{
                                        ...styles.player,
                                        border:
                                            selected === color
                                                ? "2px solid var(--accent)"
                                                : "1px solid rgba(255,255,255,0.15)",
                                        opacity: isMe ? 0.4 : 1,
                                        cursor: isMe || hasVoted ? "not-allowed" : "pointer"
                                    }}
                                >
                                    <span style={{ color, fontWeight: "bold" }}>
                                        ● {color}
                                    </span>
                                    {isMe && " (You)"}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Button */}
                <button
                    onClick={handleVote}
                    disabled={!selected || hasVoted || timeLeft === 0}
                    style={{
                        ...styles.button,
                        opacity: (!selected || hasVoted || timeLeft === 0) ? 0.6 : 1,
                        cursor: (!selected || hasVoted || timeLeft === 0) ? "not-allowed" : "pointer"
                    }}
                >
                    {hasVoted ? "Voted" : "Submit Vote"}
                </button>

            </div>
        </div>
    );
}

// Styles
const styles = {
    page: {
        height: "100dvh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "12px",
        background: "var(--bg)",
        fontFamily: "sans-serif",
        color: "var(--text-h)",
        overflow: "hidden",
        position: "relative"
    },

    bg: {
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        zIndex: 0
    },

    blob: {
        position: "absolute",
        width: 260,
        height: 260,
        borderRadius: "50%",
        filter: "blur(90px)",
        opacity: 0.45
    },

    card: {
        position: "relative",
        zIndex: 2,
        background: "var(--code-bg)",
        padding: 14,
        borderRadius: 20,
        width: "100%",
        maxWidth: 460,
        height: "100%",
        maxHeight: "92dvh",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        boxShadow: "var(--shadow)",
        overflow: "hidden"
    },

    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 2
    },

    title: {
        margin: 0,
        fontSize: 22
    },

    timer: {
        fontWeight: "bold",
        color: "#00ffcc",
        marginRight: 54
    },

    section: {
        background: "rgba(255,255,255,0.06)",
        padding: 10,
        borderRadius: 12,
        textAlign: "left",
        overflow: "hidden"
    },

    chat: {
        maxHeight: 165,
        overflowY: "auto",
        marginTop: 8
    },

    list: {
        display: "flex",
        flexDirection: "column",
        gap: 6,
        marginTop: 8,
        maxHeight: "100%",
        overflowY: "auto"
    },

    msg: {
        marginBottom: 4,
        fontSize: 13
    },

    player: {
        padding: 9,
        background: "rgba(255,255,255,0.08)",
        borderRadius: 8
    },

    button: {
        fontSize: 15,
        padding: "10px 16px",
        borderRadius: 12,
        border: "none",
        background: "var(--accent)",
        color: "white",
        fontWeight: "bold",
        width: "100%",
        flexShrink: 0
    },

    themeToggle: {
        position: "absolute",
        top: 12,
        right: 12,
        zIndex: 20,
        width: 42,
        height: 42,
        borderRadius: 12,
        border: "none",
        cursor: "pointer",
        background: "var(--code-bg)",
        color: "var(--text-h)",
        fontSize: 18
    }
};