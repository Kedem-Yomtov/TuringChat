//Game start Screen

export default function StartScreen({ setScreen, setTheme }) {
    return (
        <div style={styles.page}>

            {/* Global Safety */}
            <style>{`
                html, body, #root {
                    height: 100%;
                    margin: 0;
                    overflow: hidden;
                }

                @media (max-width: 420px) {
                    .card {
                        padding: 22px !important;
                    }

                    .box {
                        font-size: 14px !important;
                        line-height: 1.45 !important;
                    }
                }

                @media (max-width: 360px) {
                    .card {
                        padding: 18px !important;
                    }
                }
            `}</style>

            {/* Background */}
            <div style={styles.bg}>
                <div style={{ ...styles.blob, top: "10%", left: "15%", background: "#4f46e5" }} />
                <div style={{ ...styles.blob, top: "60%", left: "20%", background: "#22d3ee" }} />
                <div style={{ ...styles.blob, top: "30%", left: "70%", background: "#a855f7" }} />
                <div style={{ ...styles.blob, top: "75%", left: "75%", background: "#3b82f6" }} />
            </div>

            {/* Theme Toggle */}
            <button
                onClick={() => setTheme(prev => prev === "dark" ? "light" : "dark")}
                style={styles.themeToggle}
            >
                🌓
            </button>

            {/* Card */}
            <div style={styles.card} className="card">

                <div style={styles.titleRow}>
                    <h1 style={styles.title}>Turing Chat</h1>
                </div>

                <p style={styles.subtitle}>
                    Can you spot the AI?
                </p>

                <div style={styles.box} className="box">
                    <strong>Game Objective:</strong>
                    <br />
                    • Chat with other players
                    <br />
                    • One is secretly an AI
                    <br />
                    • Find out who it is
                </div>

                <button
                    onClick={() => setScreen("LOBBY")}
                    style={styles.button}
                >
                    Start Game
                </button>

            </div>

            {/* Feedback Button */}
            <button
                onClick={() => setScreen("CONTACT")}
                style={styles.feedbackButton}
            >
                Leave Feedback
            </button>

        </div>
    );
}

const styles = {
    page: {
        height: "100dvh",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "sans-serif",
        color: "var(--text-h)",
        background: "var(--bg)",
        padding: 16,
        boxSizing: "border-box",
        position: "relative"
    },

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
    },

    card: {
        position: "relative",
        zIndex: 2,
        width: "100%",
        maxWidth: 380,
        background: "var(--social-bg)",
        borderRadius: 22,
        padding: 28,
        backdropFilter: "blur(12px)",
        boxShadow: "var(--shadow)",
        textAlign: "center",
        boxSizing: "border-box"
    },

    titleRow: {
        display: "flex",
        justifyContent: "center",
        marginBottom: 6
    },

    title: {
        margin: 0,
        fontSize: 26,
        color: "var(--text-h)"
    },

    subtitle: {
        opacity: 0.8,
        marginBottom: 18,
        fontSize: 15
    },

    box: {
        background: "var(--social-bg)",
        padding: 16,
        borderRadius: 14,
        marginBottom: 22,
        textAlign: "left",
        lineHeight: 1.5,
        fontSize: 14
    },

    button: {
        width: "100%",
        fontSize: 16,
        padding: "12px 16px",
        borderRadius: 14,
        border: "none",
        cursor: "pointer",
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
        background: "var(--social-bg)",
        color: "var(--text-h)",
        fontSize: 18
    },

    feedbackButton: {
        position: "absolute",
        bottom: 12,
        left: "50%",
        transform: "translateX(-50%)",
        padding: "6px 12px",
        fontSize: 12,
        borderRadius: 10,
        border: "none",
        background: "var(--social-bg)",
        color: "var(--text-h)",
        cursor: "pointer",
        zIndex: 2
    }
};