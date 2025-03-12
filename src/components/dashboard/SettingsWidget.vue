<template>
    <teleport to="body">
      <Sidebar
        v-model:visible="visibleProxy"
        modal
        position="right"
        :style="drawerStyle"
        showCloseIcon
      >
        <template #header>
          <div class="flex flex-col p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 class="text-5xl font-bold text-gray-800 dark:text-gray-100">{{ t('settings.settings') }}</h2>
            <p class="text-sm text-gray-600 dark:text-gray-300">{{ t('settings.description_top') }}</p>
          </div>
        </template>
        
        <div class="flex h-full">
          <!-- Lewa kolumna - menu -->
          <aside class="w-64 border-r border-gray-200 dark:border-gray-700 p-4">
            <ul>
              <li v-for="item in menuItems" :key="item.id">
                <div>
                  <button
                    @click="selectItem(item.id)"
                    :class="{'font-bold text-blue-500': selectedSection === item.id}"
                    class="w-full text-left py-2"
                  >
                    {{ item.label }}
                  </button>
                </div>
                <!-- Jeśli element ma podmenu -->
                <ul v-if="item.subItems" class="ml-4">
                  <li v-for="sub in item.subItems" :key="sub.id">
                    <button
                      @click="selectItem(sub.id)"
                      :class="{'font-bold text-blue-500': selectedSection === sub.id}"
                      class="w-full text-left py-1"
                    >
                      {{ sub.label }}
                    </button>
                  </li>
                </ul>
              </li>
            </ul>
          </aside>
  
          <!-- Prawa kolumna - zawartość -->
          <main class="flex-1 p-4 overflow-auto">
            <div v-if="selectedSection === 'stanowiska'">
              <h3 class="text-2xl font-bold">Stanowiska</h3>
              <p>Treść ustawień dotyczących stanowisk.</p>
            </div>
            <div v-else-if="selectedSection === 'drivery'">
              <h3 class="text-2xl font-bold">Drivery</h3>
              <p>Treść ustawień dotyczących driverów.</p>
            </div>
            <div v-else-if="selectedSection === 'urzadzenia'">
              <h3 class="text-2xl font-bold">Urządzenia</h3>
              <p>Treść ustawień dotyczących urządzeń.</p>
            </div>
            <div v-else-if="selectedSection === 'rejestry'">
              <h3 class="text-2xl font-bold">Rejestry</h3>
              <p>Treść ustawień dotyczących rejestrów.</p>
            </div>
            <div v-else-if="selectedSection === 'uzytkownicy'">
                <UserManagement />
            </div>
            <div v-else-if="selectedSection === 'role'">
                <RoleManagement />
            </div>
            <div v-else>
              <h3 class="text-2xl font-bold">Wybierz opcję</h3>
              <p>Wybierz jedną z opcji z menu po lewej stronie, aby wyświetlić szczegóły.</p>
            </div>
          </main>
        </div>
      </Sidebar>
    </teleport>
  </template>
  
  <script setup>
  import { ref, computed, defineProps, defineEmits } from 'vue';
  import RoleManagement from '@/components/dashboard/RoleManagement.vue';
  import UserManagement from '@/components/dashboard/UserManagement.vue';
  import Sidebar from 'primevue/sidebar';
  
  import { useI18n } from 'vue-i18n';

  const { locale } = useI18n();
  const { t } = useI18n();
  const props = defineProps({
    visible: {
      type: Boolean,
      default: false
    }
  });
  const emit = defineEmits(['update:visible']);
  
  // Dwukierunkowe wiązanie dla v-model:visible
  const visibleProxy = computed({
    get() {
      return props.visible;
    },
    set(value) {
      emit('update:visible', value);
    }
  });
  
  const drawerStyle = {
    width: '100vw',
    height: '100vh'
  };
  
  const selectedSection = ref('');
  
  const menuItems = [
    { id: 'stanowiska', label: 'Stanowiska' },
    {
      id: 'drivery',
      label: 'Drivery',
      subItems: [
        { id: 'urzadzenia', label: 'Urządzenia' },
        { id: 'rejestry', label: 'Rejestry' }
      ]
    },
    { id: 'uzytkownicy', label: 'Użytkownicy' },
    { id: 'role', label: 'Role i uprawnienia' }
  ];
  
  const selectItem = (id) => {
    selectedSection.value = id;
  };
  </script>
  
  <style scoped>
  /* Opcjonalnie: dodaj dodatkowe style lub animacje */
  </style>
  