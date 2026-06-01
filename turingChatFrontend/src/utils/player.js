//Handles player creation

const KEY = "player_id";

export function getOrCreatePlayerId() {
    let id = sessionStorage.getItem(KEY);

    if (!id) {
        id = Math.random().toString(36).substring(2) + Date.now().toString(36);
        sessionStorage.setItem(KEY, id);
    }

    return id;
}