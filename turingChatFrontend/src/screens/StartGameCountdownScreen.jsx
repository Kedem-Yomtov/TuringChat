//Handles countdown between waiting screen and game screen

import { useEffect, useState } from "react";

export default function StartGameCountdownScreen({ setScreen }) {
    const [count, setCount] = useState(3); //set countdown length
    const [phase, setPhase] = useState("GET_READY");

    useEffect(() => {
        let interval = null;

        const timeout = setTimeout(() => {
            interval = setInterval(() => {

                setCount((prev) => {
                    if (prev > 1) return prev - 1;

                    clearInterval(interval);

                    setPhase("GO");

                    setTimeout(() => {
                        setScreen("GAME");
                    }, 700);

                    return 0;
                });

            }, 1000);
        }, 300);

        return () => {
            clearTimeout(timeout);
            if (interval) clearInterval(interval);
        };

    }, [setScreen]);

    return (
        <div style={styles.page}>

            {/* Background */}
            <div style={styles.bg}>
                <div style={{ ...styles.blob, top: "10%", left: "15%", background: "#4f46e5" }} />
                <div style={{ ...styles.blob, top: "60%", left: "20%", background: "#22d3ee" }} />
                <div style={{ ...styles.blob, top: "30%", left: "70%", background: "#a855f7" }} />
                <div style={{ ...styles.blob, top: "75%", left: "75%", background: "#3b82f6" }} />
            </div>

            <div style={styles.card}>

                <div style={phase === "GO" ? styles.bigText : styles.title}>
                    {phase === "GET_READY"
                        ? "Game starting in..."
                        : "GO!"}
                </div>

                <div style={styles.count}>
                    {phase === "GO" ? "" : count}
                </div>

            </div>
        </div>
    );
}

const styles = {
    page: {
        height: "100dvh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "var(--bg)",          
        fontFamily: "sans-serif",
        color: "var(--text-h)",          
        padding: 20,
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
        width: 280,
        height: 280,
        borderRadius: "50%",
        filter: "blur(90px)",
        opacity: 0.5
    },

    card: {
        position: "relative",
        zIndex: 2,
        background: "var(--code-bg)",    
        padding: "56px 48px",
        borderRadius: 26,
        textAlign: "center",
        backdropFilter: "blur(12px)",
        boxShadow: "var(--shadow)",      
        minWidth: 260
    },

    title: {
        fontSize: 22,
        marginBottom: 26,
        opacity: 0.9,
        letterSpacing: 0.3
    },

    count: {
        fontSize: 86,
        fontWeight: "bold",
        color: "var(--accent)",           
        lineHeight: 1
    },

    bigText: {
        fontSize: 86,
        fontWeight: "bold",
        color: "var(--accent)",          
        lineHeight: 1
    }
};