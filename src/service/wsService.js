import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { getConfig } from "@/config";
import { toast } from "vue3-toastify";

let connection = null;
let isConnected = false;
const subscribers = new Set();

const WS_URL = () => getConfig().webSocketUrl || "http://localhost:5000/ws";

/**
 * 🔹 Połączenie SignalR WebSocket (tylko raz)
 */
export const connectWebSocket = async (token = null) => {
    if (isConnected || (connection && connection.state === "Connected")) {
        console.log("🔄 WebSocket już działa!");
        return;
    }

    connection = new HubConnectionBuilder()
        .withUrl(WS_URL(), {
            accessTokenFactory: () => token, // Jeśli brak tokena, połączy się anonimowo
        })
        .configureLogging(LogLevel.Information)
        .withAutomaticReconnect()
        .build();

    try {
        await connection.start();
        isConnected = true;
        console.log("✅ SignalR WebSocket połączony:", WS_URL());

        // 🔥 Subskrybujemy aktualizację czasu
        connection.on("updateTime", (time, date) => {
            console.log("📩 Otrzymano czas:", time, date);
            notifySubscribers(time, date);
        });

        connection.onclose(() => {
            isConnected = false;
            console.warn("🔴 WebSocket rozłączony.");
        });

    } catch (err) {
        console.error("❌ Błąd WebSocket:", err);
        toast.error("❌ Błąd połączenia z WebSocket!", { autoClose: 3000 });
    }
};

/**
 * 🔹 Zamknięcie WebSocket
 */
export const closeWebSocket = async () => {
    if (connection && isConnected) {
        await connection.stop();
        isConnected = false;
        console.log("🔴 WebSocket zamknięty.");
        connection = null;
    }
};

/**
 * 🔹 Subskrybowanie aktualizacji czasu
 */
export const subscribeToTimeUpdates = (callback) => {
    subscribers.add(callback);
};

/**
 * 🔹 Odsubskrybowanie aktualizacji czasu
 */
export const unsubscribeFromTimeUpdates = (callback) => {
    subscribers.delete(callback);
};

/**
 * 🔹 Powiadamianie subskrybentów
 */
const notifySubscribers = (time, date) => {
    subscribers.forEach((callback) => callback(time, date));
};
