import { createRoom, joinRoom, quickJoinRoom } from "../api/roomApi";
import { useState } from "react";

export default function LobbyScreen({
    playerId,
    setRoom,
    setScreen,
    setTheme
}) {
    const [error, setError] = useState("");

    function showError(message) {
        setError(message);
        setTimeout(() => setError(""), 3000);
    }

    //handle creating room
    async function handleCreate() {
        try {
            setError("");
            const room = await createRoom(playerId);
            if (!room) throw new Error();

            setRoom(room);
            setScreen("WAITING");
        } catch {
            showError("Could not create room. Try again.");
        }
    }

    //handle joining room
    async function handleJoin(code) {
        try {
            setError("");

            if (!code.trim()) {
                showError("Please enter a room code.");
                return;
            }

            const normalizedCode = code.toUpperCase();
            const room = await joinRoom(normalizedCode, playerId);

            if (!room) throw new Error();

            setRoom(room);
            setScreen("WAITING");
        } catch {
            showError("Room code doesn't exist.");
        }
    }

    //handle quick joining a room
    async function handleQuickJoin() {
        try {
            setError("");
            const room = await quickJoinRoom(playerId);

            if (!room) throw new Error();

            setRoom(room);
            setScreen("WAITING");
        } catch {
            showError("Error joining room.");
        }
    }

    return (
        <div style={styles.page}>

            {/* Background Blobs */}
            <div style={styles.bg}>
                <div style={{ ...styles.blob, top: "10%", left: "15%", background: "#4f46e5" }} />
                <div style={{ ...styles.blob, top: "60%", left: "20%", background: "#22d3ee" }} />
                <div style={{ ...styles.blob, top: "30%", left: "70%", background: "#a855f7" }} />
                <div style={{ ...styles.blob, top: "75%", left: "75%", background: "#3b82f6" }} />
            </div>

            {/* Theme Toggle */}
            <button
                onClick={() => {
                    setTheme(prev => prev === "dark" ? "light" : "dark");
                }}
                style={styles.themeToggle}
            >
                🌓
            </button>

            {/* Card */}
            <div style={styles.card}>
                <h1 style={{ marginBottom: 10 }}>Lobby</h1>

                <p style={{ opacity: 0.8, marginBottom: 18 }}>
                    Join or create a game
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <button style={styles.primaryButton} onClick={handleCreate}>
                        Create Room
                    </button>

                    {/* Hue Differences */}
                    <button
                        style={styles.quickJoinButton}
                        onClick={handleQuickJoin}
                    >
                        Quick Join
                    </button>
                </div>

                <div style={styles.divider}>
                    — or join with code —
                </div>

                <JoinBox onJoin={handleJoin} />

                {error && (
                    <div style={styles.error}>
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}

// Join Box
function JoinBox({ onJoin }) {
    const [code, setCode] = useState("");

    return (
        <div style={{ display: "flex", gap: 8 }}>
            <input
                placeholder="Room Code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                style={styles.input}
            />

            <button
                onClick={() => onJoin(code)}
                style={styles.joinButton}
            >
                Join
            </button>
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
        width: 360,
        boxShadow: "var(--shadow)",
        textAlign: "center",
        backdropFilter: "blur(12px)"
    },

    primaryButton: {
        fontSize: 16,
        padding: "12px",
        borderRadius: 12,
        border: "none",
        cursor: "pointer",
        background: "var(--accent)",
        color: "white",
        fontWeight: "bold"
    },

    quickJoinButton: {
        fontSize: 16,
        padding: "12px",
        borderRadius: 12,
        border: "none",
        cursor: "pointer",
        fontWeight: "bold",

        background: "linear-gradient(135deg, #00b894, #55efc4)",
        color: "white",

        boxShadow: "0 6px 16px rgba(0,0,0,0.25)"
    },

    divider: {
        margin: "18px 0",
        opacity: 0.4,
        fontSize: 12
    },

    input: {
        flex: 1,
        padding: 10,
        borderRadius: 10,
        border: "1px solid var(--border)",
        outline: "none",
        background: "var(--bg)",
        color: "var(--text-h)",
        textTransform: "uppercase"
    },

    joinButton: {
        padding: "10px 14px",
        borderRadius: 10,
        border: "none",
        cursor: "pointer",
        background: "var(--accent)",
        color: "white",
        fontWeight: "bold"
    },

    error: {
        marginTop: 15,
        background: "#ff7675",
        padding: 10,
        borderRadius: 10,
        fontSize: 14
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
    }
};