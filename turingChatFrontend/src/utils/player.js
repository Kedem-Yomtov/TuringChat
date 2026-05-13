//Handles player creation

const KEY = "player_id";

export function getOrCreatePlayerId() {
    let id = sessionStorage.getItem(KEY);

    if (!id) {
        id = crypto.randomUUID();
        sessionStorage.setItem(KEY, id);
    }

    return id;
}