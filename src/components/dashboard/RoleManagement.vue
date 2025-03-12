<template>
    <div class="p-4">
      <h2 class="text-3xl font-bold mb-6">Zarządzanie rolami i uprawnieniami</h2>
      <div class="flex flex-col md:flex-row md:space-x-8">
        <!-- Roles Management -->
        <div class="md:w-1/2 mb-6 md:mb-0">
          <h3 class="text-2xl font-semibold mb-4">Role</h3>
          <DataTable
            :value="roles"
            :paginator="true"
            :rows="5"
            dataKey="id"
            :filters="roleFilters"
            filterDisplay="menu"
            showGridlines
            class="shadow rounded-lg bg-white dark:bg-gray-800"
          >
            <template #header>
              <div class="flex justify-between items-center flex-wrap gap-2">
                <div class="flex gap-2 items-center">
                  <Button icon="pi pi-filter-slash" label="Clear" outlined @click="clearRoleFilters" />
                  <InputText v-model="newRoleRoleName" placeholder="Nazwa nowej roli" class="w-full md:w-48" />
                  <Button icon="pi pi-plus" label="Dodaj rolę" class="p-button-primary" @click="addRole" />
                </div>
                <span class="p-input-icon-left">
                  <i class="pi pi-search" />
                  <InputText v-model="roleFilters.global.value" placeholder="Keyword Search" />
                </span>
              </div>
            </template>
            <Column field="id" header="ID" style="min-width: 3rem"></Column>
            <Column field="name" header="Nazwa roli" style="min-width: 10rem">
              <template #body="{ data }">
                <input
                  type="text"
                  v-model="data.name"
                  :disabled="data.name === 'Administrator'"
                  @input="markDirty(data)"
                  class="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-transparent text-gray-900 dark:text-gray-100"
                />
              </template>
              <template #filter="{ filterModel }">
                <InputText v-model="filterModel.value" placeholder="Search by name" class="text-sm" />
              </template>
            </Column>
            <Column header="Uprawnienia" style="min-width: 10rem">
              <template #body="{ data }">
                <MultiSelect
                  v-model="data.permissions"
                  :options="permissions"
                  :disabled="data.name === 'Administrator'"
                  optionLabel="name"
                  optionValue="id"
                  placeholder="Wybierz uprawnienia"
                  :filter="true"
                  class="w-full"
                  @change="markDirty(data)"
                />
              </template>
            </Column>
            <Column header="Akcje" style="min-width: 8rem">
              <template #body="{ data }">
                <Button
                  v-if="data.name !== 'Administrator'"
                  label="Zapisz"
                  icon="pi pi-check"
                  class="p-button-sm"
                  @click="updateRole(data)"
                />
                <Button
                  v-if="data.name !== 'Administrator'"
                  label="Usuń"
                  icon="pi pi-trash"
                  class="p-button-danger p-button-sm ml-2"
                  @click="deleteRole(data)"
                />
              </template>
            </Column>
            <!-- Opcjonalnie: możesz dodać dynamiczne podświetlanie wiersza z niezapisanymi zmianami -->
            <template #body.wrapper="{ items }">
              <tbody>
                <tr v-for="role in items" :key="role.id" :class="{'bg-yellow-100': role.dirty}" class="border-b border-gray-200 dark:border-gray-600">
                  <td class="py-2 px-4 text-sm text-gray-900 dark:text-gray-100">{{ role.id }}</td>
                  <td class="py-2 px-4">
                    <input
                      type="text"
                      v-model="role.name"
                      :disabled="role.name === 'Administrator'"
                      @input="markDirty(role)"
                      class="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-transparent text-gray-900 dark:text-gray-100"
                    />
                  </td>
                  <td class="py-2 px-4 text-sm">
                    <MultiSelect
                      v-model="role.permissions"
                      :options="permissions"
                      optionLabel="name"
                      optionValue="id"
                      placeholder="Wybierz uprawnienia"
                      :filter="true"
                      class="w-full"
                      @change="markDirty(role)"
                    />
                  </td>
                  <td class="py-2 px-4 text-sm">
                    <Button label="Zapisz" icon="pi pi-check" class="p-button-sm" @click="updateRole(role)" />
                    <Button
                      v-if="role.name !== 'Administrator'"
                      label="Usuń"
                      icon="pi pi-trash"
                      class="p-button-danger p-button-sm ml-2"
                      @click="deleteRole(role)"
                    />
                  </td>
                </tr>
              </tbody>
            </template>
          </DataTable>
        </div>
        
        <!-- Permissions Management -->
        <div class="md:w-1/2">
          <h3 class="text-2xl font-semibold mb-4">Uprawnienia</h3>
          <DataTable
            :value="permissions"
            :paginator="true"
            :rows="5"
            dataKey="id"
            :filters="permissionFilters"
            filterDisplay="menu"
            showGridlines
            class="shadow rounded-lg bg-white dark:bg-gray-800 mb-4"
          >
            <template #header>
              <div class="flex justify-between items-center">
                <Button icon="pi pi-filter-slash" label="Clear" outlined @click="clearPermissionFilters" />
                <span class="p-input-icon-left">
                  <i class="pi pi-search" />
                  <InputText v-model="permissionFilters.global.value" placeholder="Keyword Search" />
                </span>
              </div>
            </template>
            <Column field="id" header="ID" style="min-width: 3rem"></Column>
            <Column field="name" header="Nazwa uprawnienia" style="min-width: 10rem">
              <template #body="{ data }">
                <div v-if="data.edit">
                  <InputText v-model="data.name" class="w-full" />
                </div>
                <div v-else>
                  {{ data.name }}
                </div>
              </template>
              <template #filter="{ filterModel }">
                <InputText v-model="filterModel.value" placeholder="Search by name" />
              </template>
            </Column>
            <Column field="permission_key" header="Klucz" style="min-width: 8rem">
              <template #body="{ data }">
                <div v-if="data.edit">
                  <InputText v-model="data.permission_key" class="w-full" />
                </div>
                <div v-else>
                  <span class="font-mono text-sm text-gray-600 dark:text-gray-300">{{ data.permission_key }}</span>
                </div>
              </template>
              <template #filter="{ filterModel }">
                <InputText v-model="filterModel.value" placeholder="Search by key" />
              </template>
            </Column>
            <Column header="Akcje" style="min-width: 8rem">
              <template #body="{ data }">
                <div v-if="data.edit">
                  <Button label="Zapisz" icon="pi pi-check" class="p-button-sm" @click="updatePermission(data)" />
                  <Button label="Anuluj" icon="pi pi-times" class="p-button-secondary p-button-sm ml-2" @click="cancelEditPermission(data)" />
                </div>
                <div v-else>
                  <Button label="Edytuj" icon="pi pi-pencil" class="p-button-sm" @click="editPermission(data)" />
                  <Button label="Usuń" icon="pi pi-trash" class="p-button-danger p-button-sm ml-2" @click="deletePermission(data)" />
                </div>
              </template>
            </Column>
          </DataTable>
    
          <!-- Formularz dodawania nowego uprawnienia -->
          <div class="border border-gray-300 dark:border-gray-600 p-4 rounded bg-white dark:bg-gray-800">
            <h4 class="text-xl font-semibold mb-2">Dodaj nowe uprawnienie</h4>
            <div class="flex flex-col md:flex-row md:items-center md:space-x-2">
              <InputText
                v-model="newPermissionName"
                placeholder="Nazwa uprawnienia"
                class="flex-1 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 mb-2 md:mb-0 bg-transparent text-gray-900 dark:text-gray-100"
              />
              <InputText
                v-model="newPermissionKey"
                placeholder="Klucz uprawnienia"
                class="flex-1 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 mb-2 md:mb-0 bg-transparent text-gray-900 dark:text-gray-100"
              />
              <Button label="Dodaj" icon="pi pi-plus" class="p-button-primary" @click="addPermission" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
    
  <script setup>
  import { ref, onMounted } from 'vue';
  import axios from 'axios';
  import DataTable from 'primevue/datatable';
  import Column from 'primevue/column';
  import InputText from 'primevue/inputtext';
  import Button from 'primevue/button';
  import MultiSelect from 'primevue/multiselect';
  import { toast } from 'vue3-toastify';
  import { useI18n } from 'vue-i18n';
  
  const { t } = useI18n();
  const API_URL = "http://localhost:8000/api";
    
  const roles = ref([]);
  const permissions = ref([]);
  const newPermissionName = ref('');
  const newPermissionKey = ref('');
  const newRoleRoleName = ref('');
    
  // Filtrowanie dla ról
  const roleFilters = ref({
    global: { value: null, matchMode: 'contains' },
    name: { value: null, matchMode: 'startsWith' }
  });
    
  const clearRoleFilters = () => {
    roleFilters.value = {
      global: { value: null, matchMode: 'contains' },
      name: { value: null, matchMode: 'startsWith' }
    };
  };
    
  // Filtrowanie dla uprawnień
  const permissionFilters = ref({
    global: { value: null, matchMode: 'contains' },
    name: { value: null, matchMode: 'startsWith' },
    permission_key: { value: null, matchMode: 'startsWith' }
  });
    
  const clearPermissionFilters = () => {
    permissionFilters.value = {
      global: { value: null, matchMode: 'contains' },
      name: { value: null, matchMode: 'startsWith' },
      permission_key: { value: null, matchMode: 'startsWith' }
    };
  };
    
  // Pobierz dane z API
  const fetchData = async () => {
    try {
      const response = await axios.get(`${API_URL}/roles`);
      // Oczekujemy struktury: { roles: [...], permissions: [...] }
      roles.value = response.data.roles.map(role => ({ ...role, dirty: false }));
      // Dodajemy flagę "edit" dla uprawnień
      permissions.value = response.data.permissions.map(perm => ({ ...perm, edit: false }));
    } catch (error) {
      toast.error("Błąd pobierania danych");
      console.error(error);
    }
  };
    
  onMounted(() => {
    fetchData();
  });
    
  // Aktualizacja roli (PUT /api/roles/{id})
  const updateRole = async (role) => {
    try {
      await axios.put(`${API_URL}/roles/${role.id}`, role);
      toast.success("Rola zaktualizowana");
      role.dirty = false;
      fetchData();
    } catch (error) {
      toast.error("Błąd aktualizacji roli");
      console.error(error);
    }
  };
    
  // Usuwanie roli (DELETE /api/roles/{id})
  const deleteRole = async (role) => {
    try {
      await axios.delete(`${API_URL}/roles/${role.id}`);
      toast.success("Rola usunięta");
      fetchData();
    } catch (error) {
      toast.error("Błąd usuwania roli");
      console.error(error);
    }
  };
    
  // Usuwanie uprawnienia (DELETE /api/permissions/{id})
  const deletePermission = async (perm) => {
    // Sprawdź, czy to uprawnienie jest przypisane do którejkolwiek roli
    const rolesUsing = roles.value.filter(role => role.permissions.includes(perm.id));
    if (rolesUsing.length > 0) {
      rolesUsing.forEach(role => {
        role.pulse = true;
        // Po 3 sekundach usuń efekt pulsowania
        setTimeout(() => {
          role.pulse = false;
        }, 3000);
      });
      toast.warn("Uprawnienie jest przypisane do jednej lub więcej ról. Zaktualizuj role, aby móc je usunąć.");
      return; // nie wykonujemy żądania usunięcia
    }
    try {
      await axios.delete(`${API_URL}/permissions/${perm.id}`);
      toast.success("Uprawnienie usunięte");
      fetchData();
    } catch (error) {
      toast.error("Błąd usuwania uprawnienia");
      console.error(error);
    }
  };
    
  // Dodawanie nowej roli (POST /api/roles)
  const addRole = async () => {
    if (!newRoleRoleName.value.trim()) {
      toast.error("Nazwa roli nie może być pusta");
      return;
    }
    try {
      await axios.post(`${API_URL}/roles`, { name: newRoleRoleName.value, permissions: [] });
      toast.success("Rola dodana");
      newRoleRoleName.value = '';
      fetchData();
    } catch (error) {
      toast.error("Błąd dodawania roli");
      console.error(error);
    }
  };
    
  // Dodawanie nowego uprawnienia (POST /api/permissions)
  const addPermission = async () => {
    if (!newPermissionName.value.trim() || !newPermissionKey.value.trim()) {
      toast.error("Nazwa i klucz uprawnienia nie mogą być puste");
      return;
    }
    try {
      await axios.post(`${API_URL}/permissions`, { 
        name: newPermissionName.value, 
        permission_key: newPermissionKey.value 
      });
      toast.success("Uprawnienie dodane");
      newPermissionName.value = '';
      newPermissionKey.value = '';
      fetchData();
    } catch (error) {
      toast.error("Błąd dodawania uprawnienia");
      console.error(error);
    }
  };
    
  // Funkcja pomocnicza do pobierania nazwy uprawnienia
  const getPermissionName = (id) => {
    const perm = permissions.value.find(p => p.id === id);
    return perm ? perm.name : '';
  };
    
  // Funkcje edycji uprawnień
  const editPermission = (perm) => {
    perm.edit = true;
    // Opcjonalnie: można zrobić kopię zapasową, jeśli chcesz mieć możliwość anulowania zmian
    perm.backup = { name: perm.name, permission_key: perm.permission_key };
  };
    
  const cancelEditPermission = (perm) => {
    perm.edit = false;
    // Przywróć kopię zapasową
    if (perm.backup) {
      perm.name = perm.backup.name;
      perm.permission_key = perm.backup.permission_key;
    }
  };
    
  const updatePermission = async (perm) => {
    try {
      await axios.put(`${API_URL}/permissions/${perm.id}`, {
        name: perm.name,
        permission_key: perm.permission_key
      });
      toast.success("Uprawnienie zaktualizowane");
      perm.edit = false;
      fetchData();
    } catch (error) {
      toast.error("Błąd aktualizacji uprawnienia");
      console.error(error);
    }
  };
    
  // Funkcja do oznaczania zmienionych wierszy (dla ról)
  const markDirty = (role) => {
    role.dirty = true;
  };
  </script>
    
  <style scoped>
  /* Tabela */
  table {
    border-collapse: collapse;
    width: 100%;
  }
  th, td {
    padding: 8px;
    text-align: left;
  }
  .divide-y > :not([hidden]) ~ :not([hidden]) {
    border-top: 1px solid #e5e7eb;
  }
  
  /* Przyciski */
  .btn-primary {
    background-color: #3b82f6;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    cursor: pointer;
  }
  .btn-danger {
    background-color: #ef4444;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    cursor: pointer;
  }
  .ml-2 {
    margin-left: 0.5rem;
  }
  
  /* Dla wierszy z niezapisanymi zmianami */
  .bg-yellow-100 {
    background-color: #fefcbf;
  }
  </style>
  