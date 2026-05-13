import { useState, useEffect } from "react";

export default function ContactScreen({ setScreen, setTheme }) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);

    // Theme Sync
    useEffect(() => {
        const saved = localStorage.getItem("theme") || "dark";
        document.documentElement.setAttribute("data-theme", saved);
    }, []);

    async function handleSend() {
        if (!name.trim()) {
            setStatus("Name is required");
            return;
        }

        if (!message.trim()) {
            setStatus("Message is required");
            return;
        }

        setLoading(true);
        setStatus(null);

        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/feedback`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name,
                    email,
                    message
                })
            });

            if (!res.ok) {
                throw new Error("Failed to send");
            }

            setStatus("Feedback sent!");
            setName("");
            setEmail("");
            setMessage("");
        } catch (err) {
            console.error(err);
            setStatus("Failed to send feedback");
        } finally {
            setLoading(false);
        }
    }

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
                <h2 style={{ marginBottom: 10 }}>Send Feedback</h2>

                <input
                    placeholder="Full Name *"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={styles.input}
                />

                <input
                    placeholder="Email (optional)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={styles.input}
                />

                <textarea
                    placeholder="Your message *"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    style={styles.textarea}
                />

                {status && (
                    <div style={styles.status}>
                        {status}
                    </div>
                )}

                <button
                    onClick={handleSend}
                    disabled={loading}
                    style={{
                        ...styles.button,
                        opacity: loading ? 0.6 : 1,
                        cursor: loading ? "not-allowed" : "pointer"
                    }}
                >
                    {loading ? "Sending..." : "Send Feedback"}
                </button>

                <button
                    onClick={() => setScreen("START")}
                    style={styles.secondaryButton}
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
        height: "100dvh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "var(--bg)",
        color: "var(--text-h)",
        fontFamily: "sans-serif",
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
        width: "100%",
        maxWidth: 420,
        background: "var(--code-bg)",
        padding: 22,
        borderRadius: 20,
        boxShadow: "var(--shadow)",
        display: "flex",
        flexDirection: "column",
        gap: 10
    },

    input: {
        padding: 10,
        borderRadius: 10,
        border: "1px solid var(--border)",
        background: "var(--bg)",
        color: "var(--text-h)",
        outline: "none"
    },

    textarea: {
        padding: 10,
        borderRadius: 10,
        border: "1px solid var(--border)",
        background: "var(--bg)",
        color: "var(--text-h)",
        outline: "none",
        minHeight: 120,
        resize: "vertical"
    },

    status: {
        fontSize: 14,
        opacity: 0.85,
        textAlign: "center"
    },

    button: {
        padding: "12px",
        borderRadius: 12,
        border: "none",
        background: "var(--accent)",
        color: "white",
        fontWeight: "bold"
    },

    secondaryButton: {
        padding: "10px",
        borderRadius: 12,
        border: "1px solid var(--border)",
        background: "transparent",
        color: "var(--text-h)"
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