<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import AppConfigurator from './AppConfigurator.vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { toast } from "vue3-toastify";
import { logout } from "@/service/authService";
import SettingsWidget from '@/components/dashboard/SettingsWidget.vue';
import { connectWebSocket, closeWebSocket, subscribeToTimeUpdates } from "@/service/wsService";

const { toggleMenu, toggleDarkMode, isDarkTheme } = useLayout();
const { t, locale } = useI18n();
const router = useRouter();

// ------------------------------
// Profile Menu
// ------------------------------
const profileMenuActive = ref(false);
const profileMenuRef = ref(null);
const toggleProfileMenu = (event) => {
  event.stopPropagation();
  profileMenuActive.value = !profileMenuActive.value;
};

const userName = ref("Ładowanie...");

// ------------------------------
// Wylogowywanie
// ------------------------------
const handleLogout = () => {
  logout();
  localStorage.removeItem("access_token");
  localStorage.removeItem("username");
  toast.info("ℹ️ Wylogowano pomyślnie", {
    autoClose: 3000,
    onClose: () => router.push("/auth/login"),
  });
  setTimeout(() => {
    router.push("/auth/login");
  }, 3000);
};

// ------------------------------
// Aktualizacja czasu i daty
// ------------------------------
const currentTime = ref("Ładowanie...");
const currentDate = ref("Ładowanie...");

const updateTime = (time, date) => {
  console.log("🔄 Aktualizacja czasu:", time, date);
  currentTime.value = time;
  currentDate.value = date;
};

onMounted(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
        connectWebSocket(token);
    }
    subscribeToTimeUpdates(updateTime);

     // Ustawienie imienia i nazwiska użytkownika z localStorage
    const storedUserName = localStorage.getItem("username");
    if (storedUserName) {
        userName.value = storedUserName;
    } else {
        userName.value = "Nieznany użytkownik";
    }
});

onBeforeUnmount(() => {
  closeWebSocket();
  document.removeEventListener("click", handleClickOutside);
});

// ------------------------------
// Wybór języka
// ------------------------------
const languages = ref([
  { code: 'pl', lang: 'PL' },
  { code: 'en', lang: 'EN' }
]);

const languageMenuActive = ref(false);
const languageMenuRef = ref(null);

const currentLanguage = computed(() => {
  return languages.value.find(lang => lang.code === locale.value) || languages.value[0];
});

const toggleLanguageMenu = (e) => {
  e.stopPropagation();
  languageMenuActive.value = !languageMenuActive.value;
};

const selectLanguage = (lang) => {
  locale.value = lang.code;
  languageMenuActive.value = false;
};

// Rozszerzony handler kliknięć poza menu (zamykamy oba menu)
const handleClickOutside = (event) => {
  if (profileMenuRef.value && !profileMenuRef.value.contains(event.target)) {
    profileMenuActive.value = false;
  }
  if (languageMenuRef.value && !languageMenuRef.value.contains(event.target)) {
    languageMenuActive.value = false;
  }
};

// ------------------------------
// Modal ustawień
// ------------------------------
const settingsActive = ref(false);
</script>

<template>
  <div class="layout-topbar">
    <div class="layout-topbar-logo-container">
      <button class="layout-menu-button layout-topbar-action" @click="toggleMenu">
        <i class="pi pi-bars"></i>
      </button>
      <router-link to="/" class="layout-topbar-logo flex items-center">
        <i class="pi pi-warehouse text-primary drop-shadow-lg" style="font-size: 2rem;"></i>
        <span class="ml-2">CMMS System</span>
      </router-link>
    </div>

    <div class="layout-topbar-actions">
      <div class="layout-config-menu">
        <button type="button" class="layout-topbar-action" @click="toggleDarkMode">
          <i :class="['pi', { 'pi-moon': isDarkTheme, 'pi-sun': !isDarkTheme }]"></i>
        </button>
        <div class="relative">
          <button
            v-styleclass="{
              selector: '@next',
              enterFromClass: 'hidden',
              enterActiveClass: 'animate-scalein',
              leaveToClass: 'hidden',
              leaveActiveClass: 'animate-fadeout',
              hideOnOutsideClick: true
            }"
            type="button"
            class="layout-topbar-action layout-topbar-action-highlight"
          >
            <i class="pi pi-palette"></i>
          </button>
          <AppConfigurator />
        </div>
      </div>

      <button
        class="layout-topbar-menu-button layout-topbar-action"
        v-styleclass="{
          selector: '@next',
          enterFromClass: 'hidden',
          enterActiveClass: 'animate-scalein',
          leaveToClass: 'hidden',
          leaveActiveClass: 'animate-fadeout',
          hideOnOutsideClick: true
        }"
      >
        <i class="pi pi-ellipsis-v"></i>
      </button>

      <div class="layout-topbar-menu hidden lg:block">
        <div class="layout-topbar-menu-content">
          <button type="button" class="layout-topbar-action">
            <i class="pi pi-calendar"></i>
            <span>Calendar</span>
          </button>
          <button type="button" class="layout-topbar-action">
            <i class="pi pi-inbox"></i>
            <span>Messages</span>
          </button>
          <!-- Rozwijane menu dla Profile -->
          <div ref="profileMenuRef" class="relative inline-block">
            <button type="button" class="layout-topbar-action" @click="toggleProfileMenu">
              <i class="pi pi-user"></i>
              <span>{{ t('topbar.user_panel') }}</span>
            </button>
            <transition name="fade">
              <div
                v-if="profileMenuActive"
                class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 shadow-lg rounded z-50"
              >
                <!-- Informacja o użytkowniku -->
                <div class="p-3 border-b border-gray-200 dark:border-gray-700">
                  {{ userName }}
                </div>
                <!-- Pozycje menu -->
                <ul class="py-1">
                  <li>
                    <a href="#"
                       class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                      {{ t('topbar.profile') }}
                    </a>
                  </li>
                  <li>
                    <a href="#"
                       @click.prevent="settingsActive = true"
                       class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                      {{ t('topbar.settings') }}
                    </a>
                  </li>
                  <li>
                    <a href="#"
                       @click.prevent="handleLogout"
                       class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                      {{ t('topbar.logout') }}
                    </a>
                  </li>
                </ul>
              </div>
            </transition>
          </div>
          
          <!-- Wybór języka -->
          <div ref="languageMenuRef" class="flex flex-col items-end relative mt-1">
            <button @click="toggleLanguageMenu" class="flex items-center focus:outline-none">
              <span class="text-xl">
                <i class="pi pi-globe"></i>
                {{ currentLanguage.lang }}
              </span>
              <i class="pi pi-chevron-down ml-1"></i>
            </button>
            <transition name="fade">
              <div
                v-if="languageMenuActive"
                class="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 shadow-lg rounded z-50"
              >
                <ul>
                  <li v-for="lang in languages" :key="lang.code">
                    <button
                      @click="selectLanguage(lang)"
                      class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                      :class="{'bg-gray-200 dark:bg-gray-700': lang.code === currentLanguage.code}"
                    >
                      <span class="text-xl">{{ lang.lang }}</span>
                    </button>
                  </li>
                </ul>
              </div>
            </transition>
          </div>
          
          <!-- Wyświetlanie godziny i daty -->
          <div class="flex flex-col items-end">
            <div class="text-right">
              <div class="text-sm font-semibold">{{ currentTime }}</div>
              <div class="text-xs">{{ currentDate }}</div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
    <!-- Modal ustawień -->
    <SettingsWidget v-model:visible="settingsActive" />
  </div>
</template>

<style scoped>
/* Animacja fade dla rozwijanego menu */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
