<script setup lang="ts">
import { computed } from 'vue'

import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const destination = computed(() => (authStore.isAuthenticated ? '/dashboard' : '/login'))
</script>

<template>
  <VContainer class="not-found">
    <VCard max-width="560" class="pa-8 text-center" elevation="0">
      <VIcon icon="mdi-map-marker-question-outline" size="72" color="secondary" />
      <p class="not-found__code">404</p>
      <h1>Página no encontrada</h1>
      <p>La dirección solicitada no existe dentro de ERP Beauty Pro.</p>
      <VBtn :to="destination" color="primary" prepend-icon="mdi-arrow-left">
        Regresar al sistema
      </VBtn>
    </VCard>
  </VContainer>
</template>

<style scoped>
.not-found {
  display: grid;
  min-height: 100dvh;
  background-color: #f4f7f9;
  place-items: center;
}

.not-found__code {
  margin: 18px 0 0;
  color: #2f918c;
  font-size: 4rem;
  font-weight: 900;
  line-height: 1;
}

.not-found h1 {
  margin: 12px 0;
  color: #17324d;
}

.not-found p:not(.not-found__code) {
  margin-bottom: 28px;
  color: #637381;
}
</style>
