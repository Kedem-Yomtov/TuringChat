import { useEffect, useState } from "react";

export default function EndScreen({
    room,
    setScreen,
    setRoom,
    myVote,
    chat = [],
    playerId,
    setChat,
    setMyVote
}) {
    //handles snapshot of game to display to users
    const [snapshot, setSnapshot] = useState(null);

    //theme handler
    const [theme, setTheme] = useState(
        document.documentElement.getAttribute("data-theme") || "dark"
    );
    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
    }, [theme]);

    //handle game snapshot
    useEffect(() => {
        if (snapshot) return;

        const data = room?.endResult || room;
        if (!data?.results) return;

        setSnapshot({
            ...data,
            myVote: myVote ?? null
        });
    }, [room, myVote]);

    const { aiColor, results = {}, myVote: votedColor } = snapshot || {};

    // SAFETY GUARD (prevents crash)
    if (!snapshot) {
        return null;
    }

    const normalizePlayerId = (p) => {
        if (!p?.playerId) return null;

        try {
            return JSON.parse(p.playerId).playerId;
        } catch {
            return p.playerId;
        }
    };

    const players = room?.players || [];

    const myPlayer = players.find(
        p => normalizePlayerId(p) === playerId
    );

    const isAdmin = myPlayer?.admin === true;
    const correct = votedColor === aiColor;//was player vote correct
    const correctGuessCount = results?.[aiColor] || 0;//total number of correct votes

    //handle player pressing pay again button. reset game and send all players back to waiting room
    async function handlePlayAgain() {
        try {
            setChat([]);
            setMyVote(null);

            await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/room/reset/${room.roomCode}`,
                { method: "POST" }
            );
            setScreen("WAITING");
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <div style={styles.page}>

            <button
                onClick={() =>
                    setTheme(prev => (prev === "dark" ? "light" : "dark"))
                }
                style={styles.themeToggle}
            >
                🌓
            </button>

            <div style={styles.bg}>
                <div style={{ ...styles.blob, top: "10%", left: "15%", background: "#4f46e5" }} />
                <div style={{ ...styles.blob, top: "65%", left: "10%", background: "#22d3ee" }} />
                <div style={{ ...styles.blob, top: "30%", left: "75%", background: "#a855f7" }} />
                <div style={{ ...styles.blob, top: "75%", left: "70%", background: "#3b82f6" }} />
            </div>

            {correct && (
                <div style={styles.winOverlay}>
                    <div style={styles.winText}>YOU WIN ✨</div>
                </div>
            )}

            <div style={styles.card}>

                <h1 style={{ marginBottom: 10 }}>Game Over</h1>

                <p style={{ fontSize: 26, marginBottom: 14, opacity: 0.9 }}>
                    {correct ? "You Win!" : "You Lost"}
                </p>

                <div style={styles.section}>
                    <div>
                        AI was: <b style={{ color: aiColor }}>{aiColor}</b>
                    </div>

                    <div>
                        You voted:{" "}
                        <b style={{ color: votedColor }}>
                            {votedColor || "No vote"}
                        </b>
                    </div>
                </div>

                <div style={styles.section}>
                    <strong>Correct guesses</strong>
                    <div style={{ marginTop: 8 }}>
                        {correctGuessCount} player
                        {correctGuessCount !== 1 ? "s" : ""} guessed correctly
                    </div>
                </div>

                <div style={styles.section}>
                    <strong>Votes per Player</strong>

                    <div style={styles.list}>
                        {Object.entries(results).map(([color, count]) => (
                            <div key={color} style={styles.row}>
                                <span style={{ color }}>
                                    ● {color}
                                </span>
                                <span>{count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={styles.section}>
                    <strong>Chat</strong>

                    <div style={styles.chat}>
                        {chat.length === 0 && (
                            <div style={{ opacity: 0.6 }}>
                                No messages
                            </div>
                        )}

                        {chat.map((m, i) => (
                            <div key={i}>
                                <b style={{ color: m.color }}>
                                    {m.color}:
                                </b>{" "}
                                {m.text}
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    style={styles.button}
                    onClick={handlePlayAgain}
                >
                    Play Again
                </button>

                <button
                    style={{ ...styles.button, marginTop: 10 }}
                    onClick={() => {
                        setRoom(null);
                        setScreen("START");
                    }}
                >
                    Back to Start
                </button>

            </div>
        </div>
    );
}

// Styles 
const styles = {
    page: {
        minHeight: "100dvh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
        background: "var(--bg, #0b1020)",
        fontFamily: "sans-serif",
        color: "var(--text-h, white)",
        position: "relative",
        overflow: "hidden"
    },

    bg: {
        position: "absolute",
        inset: 0,
        zIndex: 0,
        overflow: "hidden"
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
        background: "var(--code-bg, rgba(30,35,60,0.8))",
        padding: 22,
        borderRadius: 20,
        width: "100%",
        maxWidth: 420,
        maxHeight: "90dvh",
        overflowY: "auto",
        textAlign: "center",
        boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
        backdropFilter: "blur(12px)"
    },

    section: {
        background: "rgba(255,255,255,0.06)",
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
        textAlign: "left"
    },

    list: {
        marginTop: 8,
        display: "flex",
        flexDirection: "column",
        gap: 6
    },

    row: {
        display: "flex",
        justifyContent: "space-between"
    },

    chat: {
        marginTop: 8,
        maxHeight: 140,
        overflowY: "auto",
        fontSize: 14
    },

    button: {
        fontSize: 16,
        padding: "12px 20px",
        borderRadius: 12,
        border: "none",
        cursor: "pointer",
        background: "linear-gradient(135deg, #6c5ce7, #a29bfe)",
        color: "white",
        fontWeight: "bold",
        width: "100%"
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
        background: "var(--code-bg, rgba(255,255,255,0.08))",
        color: "var(--text-h, white)",
        fontSize: 18
    },

    winOverlay: {
        position: "absolute",
        inset: 0,
        zIndex: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        pointerEvents: "none"
    },

    winText: {
        fontSize: 54,
        fontWeight: "900",
        color: "#fff",
        textShadow: "0 0 20px #a855f7"
    }
};