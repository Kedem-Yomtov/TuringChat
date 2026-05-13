//Manages the game’s realtime WebSocket communication 

import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

let client = null;

export function connectToRoom(
    roomCode,
    playerId,
    onRoomUpdate,
    onChat   
) {
    if (client) {
        console.log("WS: destroying previous client");
        client.deactivate();
        client = null;
    }

    client = new Client({
        webSocketFactory: () =>
            new SockJS(import.meta.env.VITE_WS_URL),
        reconnectDelay: 2000,
    });

    client.onConnect = () => {

        console.log("WS CONNECTED");

        client.publish({
            destination: "/app/connect",
            headers: { roomCode, playerId },
            body: ""
        });

        // Room State
        client.subscribe(`/topic/room/${roomCode}/state`, (msg) => {
            const data = JSON.parse(msg.body);
            onRoomUpdate(data);
        });

        // Chat
        client.subscribe(`/topic/room/${roomCode}/chat`, (msg) => {
            const data = JSON.parse(msg.body);
            onChat?.(data);
        });

      

        // Game End
        client.subscribe(`/topic/room/${roomCode}/end`, (msg) => {
            const data = JSON.parse(msg.body);
            // merge into room
            onRoomUpdate(prev => ({
                ...prev,
                endResult: data,
                status: "END"
            }));
        });
    };

    client.onStompError = (frame) => {
        console.error("❌ STOMP ERROR:", frame);
    };

    client.onWebSocketError = (err) => {
        console.error("❌ WS ERROR:", err);
    };

    client.activate();
}

// Chat
export function sendChat(roomCode, playerId, text, color) {

    if (!client) return;

    client.publish({
        destination: `/app/chat/${roomCode}`,
        body: JSON.stringify({ roomCode, playerId, text, color })
    });
}

// Disconnect
export function disconnect() {
    console.log("🔌 WS disconnect called");

    if (client) {
        client.deactivate();
        client = null;
    }
}