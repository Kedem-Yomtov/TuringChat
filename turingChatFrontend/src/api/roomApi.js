//handles communication with backend for room handling

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/room`;

// Create Room
export async function createRoom(playerId) {
    const res = await fetch(`${BASE_URL}/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId })
    });

    if (!res.ok) throw new Error("Failed to create room");
    return await res.json();
}

// Join Room
export async function joinRoom(roomCode, playerId) {
    const res = await fetch(
        `${BASE_URL}/join/${roomCode}?playerId=${playerId}`,
        { method: "POST" }
    );

    if (!res.ok) throw new Error("Failed to join room");
    return await res.json();
}

// Quick Join - adds player to random open room, creates one if necessary
export async function quickJoinRoom(playerId) {
    const res = await fetch(`${BASE_URL}/quickjoin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId })
    });

    if (!res.ok) throw new Error("Failed to quick join room");
    return await res.json();
}

// Start Game
export async function startGame(roomCode, playerId) {
    const res = await fetch(
        `${BASE_URL}/start/${roomCode}?playerId=${playerId}`,
        { method: "POST" }
    );

    if (!res.ok) throw new Error("Failed to start game");
    return await res.json();
}