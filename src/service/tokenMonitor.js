import { logout } from "@/service/authService";
import { toast } from "vue3-toastify";
import router from "@/router";

let tokenCheckInterval = null;

// Funkcja dekodująca JWT
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64).split('').map(c => 
        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      ).join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Błąd parsowania JWT:", error);
    return null;
  }
}

// Funkcja sprawdzająca ważność tokenu
export function startTokenMonitor() {
  if (tokenCheckInterval) return; // Zapobiega podwójnemu uruchomieniu

  tokenCheckInterval = setInterval(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      clearInterval(tokenCheckInterval);
      return;
    }

    const decoded = parseJwt(token);
    if (!decoded || !decoded.exp) {
      console.warn("JWT nie zawiera pola 'exp'!");
      return;
    }

    const expiryTime = decoded.exp * 1000; // JWT exp jest w sekundach, JS używa ms
    const now = Date.now();

    if (expiryTime <= now) {
      clearInterval(tokenCheckInterval);
      localStorage.removeItem("access_token");
      localStorage.removeItem("username");

      toast.error("❌ Twoja sesja wygasła! Zaloguj się ponownie.", {
        autoClose: 3000,
        onClose: () => router.push("/auth/login"),
      });
    }
  }, 60 * 1000); // sprawdza co minutę
}

export function stopTokenMonitor() {
  if (tokenCheckInterval) {
    clearInterval(tokenCheckInterval);
    tokenCheckInterval = null;
  }
}
