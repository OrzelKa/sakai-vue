import Aura from "@primevue/themes/aura";
import PrimeVue from "primevue/config";
import ConfirmationService from "primevue/confirmationservice";
import { createApp, watch } from "vue";
import { createI18n } from "vue-i18n";
import Vue3Toastify from "vue3-toastify";
import "vue3-toastify/dist/index.css"; // Import stylów
import App from "./App.vue";
import { getConfig, loadConfig } from "./config"; // Import konfiguracji
import router from "./router";
import { connectWebSocket, closeWebSocket } from "@/service/wsService"; // WebSocket
import { startTokenMonitor } from "@/service/tokenMonitor";

// Import tłumaczeń
import en from "./locales/en.json";
import pl from "./locales/pl.json";

import "@/assets/styles.scss";
import "@/assets/tailwind.css";

async function initApp() {
    await loadConfig(); // 🔥 Wczytanie `config.json` przed startem aplikacji

    const app = createApp(App);
    app.use(router);
    app.use(PrimeVue, {
        theme: {
            preset: Aura,
            options: {
                darkModeSelector: ".app-dark"
            }
        }
    });

    app.use(Vue3Toastify, {
        autoClose: 3000,
        position: "top-right",
        theme: "dark"
    });

    // ✅ System tłumaczeń
    const i18n = createI18n({
        legacy: false,
        locale: "pl",
        fallbackLocale: "en",
        messages: { pl, en }
    });

    app.use(i18n);
    app.use(ConfirmationService);

    app.mount("#app");

      // Startuje monitorowanie JWT przy starcie aplikacji
    if (localStorage.getItem("access_token")) {
        startTokenMonitor();
    }

    // // 🔥 **WebSocket działa globalnie i nie uruchamia się na stronie logowania**
    // watch(
    //     () => router.currentRoute.value.path,
    //     (newPath) => {
    //         if (newPath.startsWith("/#/auth/login")) {
    //             console.log("🛑 WebSocket zatrzymany na stronie logowania.");
    //             closeWebSocket();
    //         } else {
    //             console.log("♻️ WebSocket wznawiany dla:", newPath);
    //             const token = localStorage.getItem("access_token");
    //             connectWebSocket(token);
    //         }
    //     },
    //     { immediate: true } // Uruchom watchera od razu przy starcie
    // );
}

// ✅ Start aplikacji po załadowaniu `config.json`
initApp();
