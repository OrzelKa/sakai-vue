let config = {};

export async function loadConfig() {
    try {
        const response = await fetch('/config.json'); // Pobiera plik JSON
        config = await response.json();
    } catch (error) {
        console.error("Błąd ładowania konfiguracji:", error);
    }
}

export function getConfig() {
    return config;
}
