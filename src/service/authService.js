import { getConfig } from "@/config"; // Pobieranie dynamicznej konfiguracji
import axios from "axios";
import { startTokenMonitor } from "@/service/tokenMonitor";

const API_URL = () => getConfig().apiBaseUrl + "/auth"; // Pobieranie URL API z konfiguracji

// ✅ Funkcja logowania użytkownika
export const login = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL()}/login`, new URLSearchParams({ username, password }), {
      withCredentials: true, // Jeśli backend wymaga ciasteczek sesji
    });

    const { access_token } = response.data;
    localStorage.setItem("access_token", access_token);

    return { success: true, token: access_token };
  } catch (error) {
    console.error("🔴 Błąd logowania:", error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.detail || "Błąd logowania",
    };
  }
};

// ✅ Pobiera informacje o aktualnie zalogowanym użytkowniku
export const getUserInfo = async () => {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) throw new Error("Brak tokena JWT!");

    const response = await axios.get(`${API_URL()}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  } catch (error) {
    console.error("🔴 Błąd pobierania danych użytkownika:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return { username: "Gość", roles: [], email: "" }; // Domyślne wartości
  }
};


// ✅ Sprawdza, czy użytkownik jest zalogowany (czy istnieje token)
export const isAuthenticated = () => !!localStorage.getItem("access_token");

// ✅ Wylogowanie użytkownika
export const logout = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("username");
};

// ✅ Sprawdza, czy sesja użytkownika jest aktywna
export const checkSession = async () => {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) return false;

    const response = await axios.get(`${API_URL()}/session`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("✅ Sesja aktywna:", response.data);
    return response.data;
  } catch (error) {
    console.error("🔴 Błąd sesji:", error.response?.data || error.message);

    if (error.response?.status === 404) {
      console.warn("⚠️ Endpoint /session nie istnieje na backendzie!");
    }

    return false;
  }
};

export function handleLoginSuccess(token) {
  localStorage.setItem("access_token", token);
  startTokenMonitor();
}