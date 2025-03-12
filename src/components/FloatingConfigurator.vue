<script setup>
import AppConfigurator from '@/layout/AppConfigurator.vue';
import { useLayout } from '@/layout/composables/layout';
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';
const { t, locale } = useI18n();

const { toggleDarkMode, isDarkTheme } = useLayout();


// ------------------------------
// Wybór języka (Language Selector)
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
</script>

<template>
    <div class="fixed flex gap-4 top-8 right-8">
        <Button type="button" @click="toggleDarkMode" rounded :icon="isDarkTheme ? 'pi pi-moon' : 'pi pi-sun'" severity="secondary" />
        <div class="relative">
            <Button
                icon="pi pi-palette"
                v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'animate-scalein', leaveToClass: 'hidden', leaveActiveClass: 'animate-fadeout', hideOnOutsideClick: true }"
                type="button"
                rounded
            />
            <AppConfigurator />
        </div>

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

    </div>
</template>
