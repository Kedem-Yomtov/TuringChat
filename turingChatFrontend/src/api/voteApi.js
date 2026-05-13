import { Client } from "@stomp/stompjs";

//handles sending votes to backend

export function sendVote(roomCode, playerId, targetColor) {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/vote`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            roomCode,
            voterId: playerId,
            targetColor
        })
    });
}