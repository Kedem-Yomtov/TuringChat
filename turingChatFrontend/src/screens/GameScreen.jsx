import { useEffect, useState, useRef, useMemo } from "react";
import { connectToRoom, sendChat } from "../websocket";

//function for formatting time to display on countdown timer
function formatTime(seconds) {
    if (seconds == null) return null;

    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function GameScreen({
    room,
    playerId,
    setRoom,
    setScreen,
    chat,
    setChat
}) {
    const [connectedRoom, setConnectedRoom] = useState(room);
    const [message, setMessage] = useState("");

    const inputRef = useRef(null);

    // Mobile + Keyboard state
    const [isMobile, setIsMobile] = useState(false);
    const [keyboardOpen, setKeyboardOpen] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        checkMobile();
        window.addEventListener("resize", checkMobile);

        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    useEffect(() => {
        const vv = window.visualViewport;
        if (!vv) return;

        const updateKeyboard = () => {
            const heightDiff = window.innerHeight - vv.height;
            setKeyboardOpen(heightDiff > 150);
        };

        updateKeyboard();

        vv.addEventListener("resize", updateKeyboard);
        vv.addEventListener("scroll", updateKeyboard);

        return () => {
            vv.removeEventListener("resize", updateKeyboard);
            vv.removeEventListener("scroll", updateKeyboard);
        };
    }, []);

    useEffect(() => {
        const vv = window.visualViewport;
        if (!vv) return;

        const fixViewport = () => {
            const offsetY = vv.offsetTop || 0;

            document.documentElement.style.setProperty(
                "--vv-offset",
                `${offsetY}px`
            );
        };

        fixViewport();

        vv.addEventListener("resize", fixViewport);
        vv.addEventListener("scroll", fixViewport);

        return () => {
            vv.removeEventListener("resize", fixViewport);
            vv.removeEventListener("scroll", fixViewport);
        };
    }, []);

    // timer
    const [timerEnd, setTimerEnd] = useState(null);
    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        if (!connectedRoom?.endTime) return;
        setTimerEnd(Number(connectedRoom.endTime) + Date.now());
    }, [connectedRoom?.endTime]);

    useEffect(() => {
        if (timerEnd == null) return;
        if (timerEnd - now > 0) return;
        setScreen("VOTING");
    }, [now, timerEnd]);

    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(interval);
    }, []);

    // websocket
    useEffect(() => {
        if (!room?.roomCode || !playerId) return;

        connectToRoom(
            room.roomCode,
            playerId,
            (updatedRoom) => {
                setConnectedRoom(updatedRoom);
                setRoom(updatedRoom);
            },
            (chatMsg) => {
                setChat(prev => [...prev, chatMsg]);
            }
        );
    }, [room?.roomCode, playerId]);

    useEffect(() => {
        inputRef.current?.focus();
    }, [connectedRoom?.roomCode]);

    useEffect(() => {
        const el = document.querySelector(".chatMessages");
        if (el) el.scrollTop = el.scrollHeight;
    }, [chat]);

    const allPlayers = connectedRoom?.players || [];

    const onlinePlayers = useMemo(() => {
        return shuffle(allPlayers.filter(p => p.online));
    }, [allPlayers]);

    const normalizePlayerId = (p) => {
        if (!p?.playerId) return null;
        try {
            return JSON.parse(p.playerId).playerId;
        } catch {
            return p.playerId;
        }
    };

    const myPlayer = allPlayers.find(
        p => normalizePlayerId(p) === playerId
    );

    const timerLeft =
        timerEnd != null
            ? Math.max(0, Math.ceil((timerEnd - Date.now()) / 1000))
            : null;

    function handleSend() {
        const trimmed = message.trim();
        if (!trimmed) return;

        sendChat(
            connectedRoom.roomCode,
            playerId,
            trimmed,
            myPlayer?.color
        );

        setMessage("");

        requestAnimationFrame(() => {
            inputRef.current?.focus();
        });
    }

    const validColors = new Set(
        allPlayers
            .map(p => p.color?.toLowerCase())
            .filter(Boolean)
    );

    function getDisplayMessage(m) {
        const originalName = m.color || "UNKNOWN";

        const isRealPlayerColor =
            validColors.has(originalName.toLowerCase());

        return {
            name: originalName,
            color: isRealPlayerColor ? originalName : "#9ca3af"
        };
    }

    return (
        <div className="page">
            {/* Background */}
            <div style={bgStyles.bg}>
                <div style={{ ...bgStyles.blob, top: "10%", left: "15%", background: "#4f46e5" }} />
                <div style={{ ...bgStyles.blob, top: "60%", left: "20%", background: "#22d3ee" }} />
                <div style={{ ...bgStyles.blob, top: "30%", left: "70%", background: "#a855f7" }} />
                <div style={{ ...bgStyles.blob, top: "75%", left: "75%", background: "#3b82f6" }} />
            </div>

            <style>{`
                html, body, #root {
                    height: 100%;
                    margin: 0;
                    overflow: hidden;
                    position: fixed;
                    width: 100%;
                }

                .page {
                    width: 100%;
                    height: 100dvh;
                    display: flex;
                    flex-direction: column;
                    background: var(--bg);
                    color: var(--text-h);
                    font-family: sans-serif;

                    position: fixed;
                    inset: 0;

                    overflow: hidden;
                    overscroll-behavior: none;
                    touch-action: manipulation;

                    transform: translateY(var(--vv-offset, 0px));
                }

                .main {
                    flex: 1;
                    display: flex;
                    gap: 10px;
                    padding: 10px;
                    min-height: 0;
                    position: relative;
                    z-index: 2;
                }

                .chatCard {
                    flex: 3;
                    display: flex;
                    flex-direction: column;
                    min-height: 0;
                    background: var(--code-bg);
                    border-radius: 16px;
                    overflow: hidden;
                }

                .chatMessages {
                    flex: 1;
                    overflow-y: auto;
                    padding: 12px;
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    -webkit-overflow-scrolling: touch;
                    overscroll-behavior: contain;
                }

                .inputBar {
                    display: flex;
                    padding: 10px;
                    border-top: 1px solid var(--border);
                    background: var(--code-bg);
                }

                @media (max-width: 768px) {
                    .main {
                        flex-direction: column;
                        padding: 8px;
                        gap: 8px;
                    }
                }
            `}</style>

            {/* Header */}
            <div style={styles.headerCard}>
                <div>
                    Room <span style={styles.roomBadge}>{connectedRoom?.roomCode}</span>
                </div>

                <div style={styles.timer}>
                    {timerLeft != null ? `⏳ ${formatTime(timerLeft)}` : "Waiting"}
                </div>

                <div style={styles.you}>
                    You:{" "}
                    <b style={{ color: myPlayer?.color || "#aaa" }}>
                        {myPlayer?.color || "Loading"}
                    </b>
                </div>
            </div>

            {/* Main */}
            <div className="main">

                <div className="chatCard">

                    <div className="chatMessages">
                        {chat.map((m, i) => {
                            const display = getDisplayMessage(m);

                            return (
                                <div key={i} style={styles.message}>
                                    <span style={{ color: display.color, fontWeight: "bold" }}>
                                        {display.name}:
                                    </span>{" "}
                                    {m.text}
                                </div>
                            );
                        })}
                    </div>

                    <div className="inputBar">
                        <input
                            ref={inputRef}
                            style={styles.input}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            placeholder="Type a message..."
                        />

                        <button style={styles.button} onClick={handleSend}>
                            Send
                        </button>
                    </div>

                    {isMobile && !keyboardOpen && (
                        <div style={styles.sidebarCard}>
                            <h3 style={{ marginTop: 0 }}>Players</h3>
                            {onlinePlayers.map((p, i) => (
                                <div key={i} style={{ color: p.color }}>
                                    ● {p.color}
                                </div>
                            ))}
                        </div>
                    )}

                </div>

                {!isMobile && (
                    <div style={styles.sidebarCard}>
                        <h3 style={{ marginTop: 0 }}>Players</h3>
                        {onlinePlayers.map((p, i) => (
                            <div key={i} style={{ color: p.color }}>
                                ● {p.color}
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
}

// styles
const styles = {
    headerCard: {
        display: "flex",
        justifyContent: "space-between",
        padding: "12px 18px",
        background: "var(--code-bg)",
        position: "relative",
        zIndex: 2
    },
    roomBadge: {
        background: "var(--border)",
        padding: "4px 10px",
        borderRadius: 999,
        marginLeft: 6,
        fontSize: 12
    },
    timer: {
        fontWeight: "bold",
        color: "#00ffcc",
        minWidth: 80,
        textAlign: "center"
    },
    you: { opacity: 0.9 },
    message: { marginBottom: 8, fontSize: 14 },
    input: {
        flex: 1,
        padding: 10,
        borderRadius: 10,
        border: "none",
        outline: "none",
        background: "var(--bg)",
        color: "var(--text-h)",
        fontSize: 16
    },
    button: {
        marginLeft: 10,
        padding: "10px 14px",
        borderRadius: 10,
        border: "none",
        background: "var(--accent)",
        color: "white",
        fontWeight: "bold"
    },
    sidebarCard: {
        flex: 1,
        minWidth: 160,
        background: "var(--code-bg)",
        borderRadius: 16,
        padding: 12,
        position: "relative",
        zIndex: 2
    }
};

const bgStyles = {
    bg: {
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        zIndex: 0,
        pointerEvents: "none"
    },
    blob: {
        position: "absolute",
        width: 260,
        height: 260,
        borderRadius: "50%",
        filter: "blur(90px)",
        opacity: 0.55
    }
};

function shuffle(array) {
    return [...array].sort(() => Math.random() - 0.5);
}