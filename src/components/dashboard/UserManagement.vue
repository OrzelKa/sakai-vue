<template>
    <div class="p-4">
      <h2 class="text-3xl font-bold mb-6">Lista użytkowników</h2>
  
      <DataTable
        :value="users"
        :paginator="true"
        :rows="5"
        dataKey="id"
        :filters="userFilters"
        filterDisplay="menu"
        showGridlines
        class="shadow rounded-lg bg-white dark:bg-gray-800"
      >
        <!-- Nagłówek tabeli z przyciskiem Clear -->
        <template #header>
          <div class="flex justify-between items-center flex-wrap gap-2">
            <div class="flex gap-2 items-center">
              <Button icon="pi pi-filter-slash" label="Clear" outlined @click="clearUserFilters" />
            </div>
            <span class="p-input-icon-left">
              <i class="pi pi-search" />
              <InputText v-model="userFilters.global.value" placeholder="Keyword Search" />
            </span>
          </div>
        </template>
  
        <!-- Kolumna: username -->
        <Column field="username" header="Użytkownik" style="min-width: 10rem">
          <template #body="{ data }">{{ data.username }}</template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" placeholder="Search by username" class="text-sm" />
          </template>
        </Column>
  
        <!-- Kolumna: first_name -->
        <Column field="first_name" header="Imię" style="min-width: 8rem">
          <template #body="{ data }">{{ data.first_name }}</template>
        </Column>
  
        <!-- Kolumna: last_name -->
        <Column field="last_name" header="Nazwisko" style="min-width: 8rem">
          <template #body="{ data }">{{ data.last_name }}</template>
        </Column>
  
        <!-- Kolumna: email -->
        <Column field="email" header="Email" style="min-width: 12rem">
          <template #body="{ data }">{{ data.email }}</template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" placeholder="Search by email" class="text-sm" />
          </template>
        </Column>
  
        <!-- Kolumna: phone_number -->
        <Column field="phone_number" header="Telefon" style="min-width: 10rem">
          <template #body="{ data }">{{ data.phone_number }}</template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" placeholder="Search by phone" class="text-sm" />
          </template>
        </Column>
  
        <!-- Kolumna: rola (role?.name) -->
        <Column header="Rola" style="min-width: 8rem">
          <template #body="{ data }">
            <span v-if="data.role">{{ data.role.name }}</span>
            <span v-else class="text-gray-500">Brak roli</span>
          </template>
        </Column>
  
        <!-- Kolumna: Akcje (ikony) + przycisk "Dodaj użytkownika" w nagłówku -->
        <Column style="min-width: 8rem">
          <template #header>
            <Button
              icon="pi pi-plus"
              label="Dodaj użytkownika"
              class="p-button-primary"
              @click="showAddDialog = true"
            />
          </template>
          <template #body="{ data }">
            <Button
              icon="pi pi-user-edit"
              class="p-button-rounded p-button-warning p-button-sm mr-2"
              @click="editUser(data)"
            />
            <Button
              icon="pi pi-trash"
              class="p-button-rounded p-button-danger p-button-sm"
              @click="confirmDelete(data)"
            />
          </template>
        </Column>
      </DataTable>
  
      <!-- Dialog dodawania użytkownika -->
      <Dialog
        v-model:visible="showAddDialog"
        header="Dodaj użytkownika"
        :modal="true"
        :closable="true"
        :style="{ width: '30rem' }"
      >
        <div class="flex flex-col gap-2">
          <label>Użytkownik (username)</label>
          <InputText v-model="newUser.username" />
  
          <label>Hasło</label>
          <InputText v-model="newUser.password" type="password" />
  
          <label>Powtórz hasło</label>
          <InputText v-model="newUser.confirmPassword" type="password" />
  
          <label>Imię</label>
          <InputText v-model="newUser.first_name" />
  
          <label>Nazwisko</label>
          <InputText v-model="newUser.last_name" />
  
          <label>Email</label>
          <InputText v-model="newUser.email" />
  
          <label>Telefon</label>
          <InputText v-model="newUser.phone_number" />
  
          <label>Rola (ID)</label>
          <Dropdown
            v-model="newUser.role_id"
            :options="roleOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Wybierz rolę"
          />
  
          <div class="flex justify-end gap-2 mt-4">
            <Button label="Anuluj" class="p-button-text" @click="showAddDialog = false" />
            <Button label="Zapisz" class="p-button-primary" @click="createUser" />
          </div>
        </div>
      </Dialog>
  
      <!-- Dialog edycji użytkownika -->
      <Dialog
        v-model:visible="showEditDialog"
        header="Edytuj użytkownika"
        :modal="true"
        :closable="true"
        :style="{ width: '30rem' }"
      >
        <div class="flex flex-col gap-2">
          <label>Użytkownik (username)</label>
          <InputText v-model="editUserData.username" disabled />
  
          <label>Imię</label>
          <InputText v-model="editUserData.first_name" />
  
          <label>Nazwisko</label>
          <InputText v-model="editUserData.last_name" />
  
          <label>Email</label>
          <InputText v-model="editUserData.email" />
  
          <label>Telefon</label>
          <InputText v-model="editUserData.phone_number" />
  
          <label>Nowe hasło</label>
          <InputText v-model="editUserData.newPassword" type="password" />
  
          <label>Powtórz nowe hasło</label>
          <InputText v-model="editUserData.confirmNewPassword" type="password" />
  
          <label>Rola (ID)</label>
          <Dropdown
            v-model="editUserData.role_id"
            :options="roleOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Wybierz rolę"
            :disabled="editUserData.role?.name === 'Administrator'"
          />
  
          <div class="flex justify-end gap-2 mt-4">
            <Button label="Anuluj" class="p-button-text" @click="showEditDialog = false" />
            <Button label="Zapisz" class="p-button-primary" @click="updateUser(editUserData)" />
          </div>
        </div>
      </Dialog>
  
      <!-- Dialog potwierdzenia usunięcia -->
      <Dialog
        v-model:visible="showDeleteDialog"
        header="Potwierdzenie usunięcia"
        :modal="true"
        :closable="true"
        :style="{ width: '25rem' }"
      >
        <p>Czy na pewno chcesz usunąć użytkownika: <strong>{{ userToDelete?.username }}</strong>?</p>
        <div class="flex justify-end gap-2 mt-4">
          <Button label="Nie" class="p-button-text" @click="showDeleteDialog = false" />
          <Button label="Tak" class="p-button-danger" @click="deleteUserConfirm" />
        </div>
      </Dialog>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import axios from 'axios';
  import { useI18n } from 'vue-i18n';
  import { toast } from 'vue3-toastify';
  import 'vue3-toastify/dist/index.css';
  
  // PrimeVue komponenty
  import DataTable from 'primevue/datatable';
  import Column from 'primevue/column';
  import InputText from 'primevue/inputtext';
  import Button from 'primevue/button';
  import Dialog from 'primevue/dialog';
  import Dropdown from 'primevue/dropdown';
  
  const { t } = useI18n();
  
  // Adres do endpointów
  const USERS_API = 'http://localhost:8000/api/users/';
  const ROLES_API = 'http://localhost:8000/api/roles';
  
  // Lista użytkowników
  const users = ref([]);
  
  // Filtry do DataTable
  const userFilters = ref({
    global: { value: null, matchMode: 'contains' },
    username: { value: null, matchMode: 'startsWith' },
    email: { value: null, matchMode: 'startsWith' },
    phone_number: { value: null, matchMode: 'startsWith' }
  });
  
  // Dialogi
  const showAddDialog = ref(false);
  const showEditDialog = ref(false);
  const showDeleteDialog = ref(false);
  
  // Formularze
  const newUser = ref({
    username: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    role_id: null
  });
  const editUserData = ref({});
  const userToDelete = ref(null);
  
  // Lista ról do dropdowna
  const roleOptions = ref([]);
  
  /**
   * Pobiera listę użytkowników z backendu (GET /api/users)
   */
  const fetchUsers = async () => {
    try {
      const response = await axios.get(USERS_API);
      users.value = response.data.users;
    } catch (error) {
      toast.error('Błąd pobierania użytkowników');
      console.error('Błąd pobierania użytkowników:', error);
    }
  };
  
  /**
   * Pobiera listę ról z backendu (GET /api/roles)
   */
  const fetchRoles = async () => {
    try {
      const response = await axios.get(ROLES_API);
      // Zakładamy, że backend zwraca { roles: [...], permissions: [...] }
      roleOptions.value = response.data.roles.map((role) => ({
        label: role.name,
        value: role.id
      }));
    } catch (error) {
      toast.error('Błąd pobierania ról');
      console.error('Błąd pobierania ról:', error);
    }
  };
  
  // Montowanie
  onMounted(() => {
    fetchUsers();
    fetchRoles();
  });
  
  // Reset filtrów
  const clearUserFilters = () => {
    userFilters.value = {
      global: { value: null, matchMode: 'contains' },
      username: { value: null, matchMode: 'startsWith' },
      email: { value: null, matchMode: 'startsWith' },
      phone_number: { value: null, matchMode: 'startsWith' }
    };
  };
  
  /**
   * Tworzenie nowego użytkownika (POST)
   */
  const createUser = async () => {
    // Walidacja haseł
    if (newUser.value.password !== newUser.value.confirmPassword) {
      toast.error('Hasła się nie zgadzają!');
      return;
    }
  
    const payload = {
      username: newUser.value.username,
      password: newUser.value.password,
      first_name: newUser.value.first_name || null,
      last_name: newUser.value.last_name || null,
      email: newUser.value.email || null,
      phone_number: newUser.value.phone_number || null,
      role_id: newUser.value.role_id
    };
    try {
      await axios.post(USERS_API, payload);
      toast.success('Użytkownik utworzony pomyślnie!');
      showAddDialog.value = false;
  
      // Reset formularza
      newUser.value = {
        username: '',
        password: '',
        confirmPassword: '',
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        role_id: null
      };
      fetchUsers();
    } catch (error) {
      if (error.response && error.response.data && error.response.data.detail) {
        const detailObj = error.response.data.detail;
        Object.keys(detailObj).forEach((errorKey) => {
          const translatedMessage = t(errorKey);
          toast.error(translatedMessage);
        });
      } else {
        toast.error('Błąd tworzenia użytkownika');
      }
      console.error('Błąd tworzenia użytkownika:', error);
    }
  };
  
  /**
   * Edycja użytkownika (otwarcie dialogu)
   */
  const editUser = (user) => {
    editUserData.value = {
      id: user.id,
      username: user.username,
      // hasło do zmiany
      newPassword: '',
      confirmNewPassword: '',
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      phone_number: user.phone_number || '',
      role_id: user.role ? user.role.id : null,
      role: user.role
    };
    showEditDialog.value = true;
  };
  
  /**
   * Aktualizacja użytkownika (PUT)
   */
  const updateUser = async (user) => {
    // Sprawdź pola hasła
    let finalPassword = null;
    if (user.newPassword || user.confirmNewPassword) {
      if (user.newPassword !== user.confirmNewPassword) {
        toast.error('Nowe hasła się nie zgadzają!');
        return;
      }
      finalPassword = user.newPassword;
    }
  
    const payload = {
      first_name: user.first_name || null,
      last_name: user.last_name || null,
      email: user.email || null,
      phone_number: user.phone_number || null,
      role_id: user.role_id
    };
  
    // Jeśli finalPassword istnieje, wysyłamy je jako new_password
    if (finalPassword) {
      payload.new_password = finalPassword;
      payload.confirm_password = finalPassword;
    }
  
    try {
      await axios.put(`${USERS_API}${user.id}`, payload);
      toast.success('Użytkownik zaktualizowany!');
      showEditDialog.value = false;
      fetchUsers();
    } catch (error) {
      toast.error('Błąd aktualizacji użytkownika');
      console.error('Błąd aktualizacji użytkownika:', error);
    }
  };
  
  /**
   * Usuwanie użytkownika – potwierdzenie
   */
  const confirmDelete = (user) => {
    userToDelete.value = user;
    showDeleteDialog.value = true;
  };
  
  /**
   * Usuwanie użytkownika (DELETE)
   */
  const deleteUserConfirm = async () => {
    if (!userToDelete.value) return;
    try {
      await axios.delete(`${USERS_API}${userToDelete.value.id}`);
      toast.success('Użytkownik usunięty!');
      showDeleteDialog.value = false;
      userToDelete.value = null;
      fetchUsers();
    } catch (error) {
      toast.error('Błąd usuwania użytkownika');
      console.error('Błąd usuwania użytkownika:', error);
    }
  };
  </script>
  
  <style scoped>
  /* Dodatkowe style opcjonalnie */
  </style>
  