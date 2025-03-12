<script setup>
import FloatingConfigurator from '@/components/FloatingConfigurator.vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { login, getUserInfo } from "@/service/authService"; // funkcje autoryzacyjne
import { toast } from "vue3-toastify";
import { useI18n } from 'vue-i18n';

const { locale } = useI18n();
const { t } = useI18n();

// Przykładowa funkcja do zmiany języka
const changeLanguage = (lang) => {
  locale.value = lang;
};

const email = ref('');
const password = ref('');
const checked = ref(false);

const loading = ref(false);
const errors = ref({ email: '', password: '' });
const errorMessage = ref('');
const router = useRouter();

const handleLogin = async () => {
  // Reset błędów
  errors.value = { email: '', password: '' };
  errorMessage.value = '';

  // Prosta walidacja pól
  if (!email.value) {
    errors.value.email = t('login.messages.emailRequired');
  }
  if (!password.value || password.value.length < 6) {
    errors.value.password = t('login.messages.passwordMinLength', { min: 6, chars: t('login.messages.chars') });
}
  if (errors.value.email || errors.value.password) return;

  loading.value = true;
  try {
    const response = await login(email.value, password.value);
    if (response.success) {
      toast.success("✅ Zalogowano pomyślnie!", { autoClose: 3000 });
      // Pobranie informacji o użytkowniku
      const userInfo = await getUserInfo();
      localStorage.setItem("username", userInfo.username);
      localStorage.setItem("firstLastName", `${userInfo.firstName} ${userInfo.lastName}`);

      // Zapis ról do localStorage
      localStorage.setItem("roles", JSON.stringify(userInfo.roles));
      // Przekierowanie do dashboardu po krótkiej przerwie
      setTimeout(() => {
        router.push("/dashboard");
      }, 3000);
    } else {
      toast.error("❌ " + response.message, { autoClose: 3000 });
    }
  } catch (error) {
    console.error("Błąd logowania:", error);
    toast.error("❌ Wystąpił błąd podczas logowania.", { autoClose: 3000 });
  } finally {
    loading.value = false;
  }
};
</script>


<template>
  <FloatingConfigurator />
  <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden">
    <div class="flex flex-col items-center justify-center">
      <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
        <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
          <div class="text-center mb-8">
            <i class="pi pi-warehouse text-primary mb-8 drop-shadow-lg" style="font-size: 4rem;"></i>
            <div class="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-green-500 text-4xl font-bold tracking-wide mb-4 drop-shadow-lg">
              CMMS System
            </div>
          </div>
          
          <!-- Formularz logowania -->
          <form @submit.prevent="handleLogin">
            <label for="email1" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">{{ t('login.email.label') }}</label>
            <InputText
              id="email1"
              type="text"
              :placeholder="t('login.email.input.placeholder')"
              class="w-full md:w-[30rem] mb-2"
              v-model="email"
            />
            <div v-if="errors.email" class="text-red-500 text-sm mb-4">{{ errors.email }}</div>

            <label for="password1" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">{{ t('login.password.label') }}</label>
            <Password
              id="password1"
              v-model="password"
              :placeholder="t('login.password.input.placeholder')"
              :toggleMask="true"
              class="mb-2"
              fluid
              :feedback="false"
            />
            <div v-if="errors.password" class="text-red-500 text-sm mb-4">{{ errors.password }}</div>

            <div class="flex items-center justify-between mt-2 mb-8 gap-8">
              <div class="flex items-center">
                <Checkbox v-model="checked" id="rememberme1" binary class="mr-2"></Checkbox>
                <label for="rememberme1">{{ t('login.remember') }}</label>
              </div>
              <span class="font-medium no-underline ml-2 text-right cursor-pointer text-primary">{{ t('login.forgot') }}</span>
            </div>

            <Button :label="t('login.signIn')" class="w-full" :loading="loading" type="submit"></Button>
            <div v-if="errorMessage" class="mt-4 text-red-500 text-sm text-center">
              {{ errorMessage }}
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pi-eye {
  transform: scale(1.6);
  margin-right: 1rem;
}

.pi-eye-slash {
  transform: scale(1.6);
  margin-right: 1rem;
}
</style>
