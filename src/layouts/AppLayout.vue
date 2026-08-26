<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { AUTH_UNAUTHORIZED_EVENT } from '@/services/http'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()
const drawer = ref(true)

const userInitial = computed(() => authStore.user?.email.charAt(0).toUpperCase() ?? 'U')

const companyReference = computed(() => {
  const companyId = authStore.companyId

  return companyId ? companyId.slice(0, 8).toUpperCase() : 'SIN EMPRESA'
})

async function handleLogout(): Promise<void> {
  authStore.logout()
  await router.replace('/login')
}

function handleUnauthorized(): void {
  authStore.logout()

  void router.replace({
    name: 'login',
    query: { reason: 'expired' },
  })
}

onMounted(() => {
  window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized)
})

onBeforeUnmount(() => {
  window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized)
})
</script>

<template>
  <VNavigationDrawer v-model="drawer" width="272">
    <div class="brand">
      <div class="brand__icon">
        <VIcon icon="mdi-content-cut" size="30" />
      </div>

      <div>
        <p class="brand__name">ERP Beauty Pro</p>
        <p class="brand__caption">Gestión de peluquerías</p>
      </div>
    </div>

    <VDivider />

    <VList nav density="comfortable" class="px-3 py-4">
      <VListSubheader>MENÚ PRINCIPAL</VListSubheader>
      <VListItem
        to="/dashboard"
        prepend-icon="mdi-view-dashboard-outline"
        title="Dashboard"
        rounded="lg"
      />
      <VListItem
        to="/appointments"
        prepend-icon="mdi-calendar-clock-outline"
        title="Agenda y citas"
        rounded="lg"
      />
    </VList>

    <template #append>
      <div class="company-reference">
        <VIcon icon="mdi-domain" size="19" />
        <div>
          <span>Empresa</span>
          <strong>{{ companyReference }}</strong>
        </div>
      </div>
    </template>
  </VNavigationDrawer>

  <VAppBar elevation="0" border="b">
    <VAppBarNavIcon aria-label="Mostrar u ocultar menÚ" @click="drawer = !drawer" />

    <VAppBarTitle>
      <span class="app-bar-title">Panel administrativo</span>
    </VAppBarTitle>

    <VMenu location="bottom end">
      <template #activator="{ props }">
        <VBtn v-bind="props" variant="text" class="user-button" aria-label="Abrir menÚ del usuario">
          <VAvatar color="secondary" size="36">{{ userInitial }}</VAvatar>
          <div class="user-button__information">
            <strong>{{ authStore.user?.email }}</strong>
            <span>Usuario autenticado</span>
          </div>
          <VIcon icon="mdi-chevron-down" />
        </VBtn>
      </template>

      <VList min-width="240">
        <VListItem
          prepend-icon="mdi-account-outline"
          title="Mi cuenta"
          :subtitle="authStore.user?.email"
        />
        <VDivider class="my-2" />
        <VListItem prepend-icon="mdi-logout" title="Cerrar sesión" @click="handleLogout" />
      </VList>
    </VMenu>
  </VAppBar>

  <VMain class="main-content">
    <RouterView />
  </VMain>
</template>

<style scoped>
.brand {
  display: flex;
  gap: 14px;
  align-items: center;
  min-height: 72px;
  padding: 14px 20px;
}

.brand__icon {
  display: grid;
  width: 42px;
  height: 42px;
  color: #ffffff;
  background: linear-gradient(135deg, #2f918c, #17324d);
  border-radius: 12px;
  place-items: center;
}

.brand__name {
  margin: 0;
  color: #17324d;
  font-size: 1rem;
  font-weight: 800;
}

.brand__caption {
  margin: 2px 0 0;
  color: #7a8793;
  font-size: 0.73rem;
}

.company-reference {
  display: flex;
  gap: 12px;
  align-items: center;
  margin: 16px;
  padding: 14px;
  color: #52616f;
  background-color: #f1f6f7;
  border-radius: 12px;
}

.company-reference div {
  display: flex;
  flex-direction: column;
}

.company-reference span {
  font-size: 0.7rem;
}

.company-reference strong {
  color: #17324d;
  font-size: 0.78rem;
}

.app-bar-title {
  color: #17324d;
  font-size: 1rem;
  font-weight: 700;
}

.user-button {
  height: auto;
  min-height: 54px;
  margin-right: 12px;
  padding: 7px 10px;
  text-transform: none;
}

.user-button__information {
  display: flex;
  max-width: 230px;
  flex-direction: column;
  align-items: flex-start;
  margin: 0 8px;
  line-height: 1.25;
}

.user-button__information strong {
  overflow: hidden;
  width: 100%;
  font-size: 0.82rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-button__information span {
  color: #7a8793;
  font-size: 0.7rem;
}

.main-content {
  min-height: 100dvh;
  background-color: #f4f7f9;
}

@media (max-width: 700px) {
  .user-button__information {
    display: none;
  }
}
</style>
