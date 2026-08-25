<script setup lang="ts">
import { computed } from 'vue'

import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const verificationLabel = computed(() =>
  authStore.user?.is_verified ? 'Verificado' : 'Pendiente de verificación',
)
</script>

<template>
  <VContainer fluid class="dashboard pa-6 pa-md-8">
    <div class="dashboard__header">
      <div>
        <p class="dashboard__eyebrow">Resumen general</p>
        <h1>Bienvenido a ERP Beauty Pro</h1>
        <p>La base del frontend y la autenticación con FastAPI están disponibles.</p>
      </div>

      <VChip color="success" variant="tonal" prepend-icon="mdi-check-circle"> Sesion activa </VChip>
    </div>

    <VRow>
      <VCol cols="12" md="4">
        <VCard class="status-card" elevation="0">
          <VCardText>
            <VAvatar color="primary" variant="tonal" class="mb-5">
              <VIcon icon="mdi-account-check-outline" />
            </VAvatar>
            <p class="status-card__label">Usuario</p>
            <strong>{{ authStore.user?.email }}</strong>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12" md="4">
        <VCard class="status-card" elevation="0">
          <VCardText>
            <VAvatar color="secondary" variant="tonal" class="mb-5">
              <VIcon icon="mdi-domain" />
            </VAvatar>
            <p class="status-card__label">Empresa</p>
            <strong class="identifier">{{ authStore.companyId }}</strong>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12" md="4">
        <VCard class="status-card" elevation="0">
          <VCardText>
            <VAvatar color="info" variant="tonal" class="mb-5">
              <VIcon icon="mdi-shield-account-outline" />
            </VAvatar>
            <p class="status-card__label">Estado de la cuenta</p>
            <strong>{{ verificationLabel }}</strong>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <VCard class="mt-6" elevation="0">
      <VCardText class="pa-6">
        <div class="next-step">
          <VAvatar color="success" variant="tonal" size="52">
            <VIcon icon="mdi-rocket-launch-outline" size="28" />
          </VAvatar>
          <div>
            <h2>Frontend listo para crecer</h2>
            <p>
              Los modulos funcionales se incorporaran al menÚ en los siguientes bloques del
              desarrollo.
            </p>
          </div>
        </div>
      </VCardText>
    </VCard>
  </VContainer>
</template>

<style scoped>
.dashboard {
  max-width: 1440px;
}

.dashboard__header {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 30px;
}

.dashboard__header h1 {
  margin-bottom: 8px;
  color: #17324d;
  font-size: clamp(1.65rem, 3vw, 2.25rem);
}

.dashboard__header p {
  color: #637381;
}

.dashboard__eyebrow {
  margin-bottom: 6px;
  color: #2f918c !important;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.status-card {
  height: 100%;
  border: 1px solid #e4eaee;
}

.status-card__label {
  margin-bottom: 6px;
  color: #7a8793;
  font-size: 0.78rem;
}

.status-card strong {
  color: #17324d;
  font-size: 0.95rem;
}

.identifier {
  overflow-wrap: anywhere;
}

.next-step {
  display: flex;
  gap: 18px;
  align-items: center;
}

.next-step h2 {
  margin-bottom: 5px;
  color: #17324d;
  font-size: 1.1rem;
}

.next-step p {
  margin: 0;
  color: #637381;
}

@media (max-width: 600px) {
  .dashboard__header {
    flex-direction: column;
  }

  .next-step {
    align-items: flex-start;
  }
}
</style>
