<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth'
import { getApiErrorMessage } from '@/utils/api-error'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const errorMessage = ref('')

const sessionMessage = computed(() =>
  route.query.reason === 'expired' ? 'Tu sesión expiró. Ingresa nuevamente.' : '',
)

const emailRules = [
  (value: string) => Boolean(value?.trim()) || 'El correo electrónico es obligatorio',
  (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || 'Ingresa un correo electrónico válido',
]

const passwordRules = [
  (value: string) => Boolean(value) || 'La contraseña es obligatoria',
  (value: string) => value.length >= 8 || 'La contraseña debe tener mínimo 8 caracteres',
]

const canSubmit = computed(
  () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()) && password.value.length >= 8,
)

async function handleSubmit(): Promise<void> {
  if (!canSubmit.value || authStore.isLoading) {
    return
  }

  errorMessage.value = ''

  try {
    await authStore.login({
      email: email.value,
      password: password.value,
    })

    const redirect =
      typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/')
        ? route.query.redirect
        : '/dashboard'

    await router.replace(redirect)
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'No fue posible iniciar sesión')
  }
}
</script>

<template>
  <main id="main-content" class="login-page" tabindex="-1">
    <div class="login-page__decoration" aria-hidden="true" />

    <VContainer class="login-container">
      <VRow justify="center" align="center">
        <VCol cols="12" sm="10" md="9" lg="8" xl="7">
          <VCard class="login-card" elevation="12" rounded="xl">
            <VRow no-gutters>
              <VCol cols="12" md="5" class="brand-panel d-flex flex-column justify-space-between">
                <div>
                  <VIcon icon="mdi-content-cut" size="64" class="mb-6" />
                  <p class="brand-panel__eyebrow">Gestión profesional</p>
                  <h1 class="brand-panel__title">ERP Beauty Pro</h1>
                  <p class="brand-panel__description">
                    Administra tu peluquería desde una plataforma centralizada, segura y eficiente.
                  </p>
                </div>

                <div class="brand-panel__security">
                  <VIcon icon="mdi-shield-check-outline" size="22" />
                  <span>Acceso protegido mediante autenticación JWT</span>
                </div>
              </VCol>

              <VCol cols="12" md="7">
                <div class="form-panel">
                  <div class="mb-8">
                    <p class="form-panel__eyebrow">Bienvenido</p>
                    <h2 class="form-panel__title">Inicia sesión</h2>
                    <p class="form-panel__description">
                      Ingresa tus credenciales para acceder al sistema.
                    </p>
                  </div>

                  <VAlert
                    v-if="sessionMessage && !errorMessage"
                    type="info"
                    variant="tonal"
                    class="mb-6"
                  >
                    {{ sessionMessage }}
                  </VAlert>

                  <VAlert
                    v-if="errorMessage"
                    type="error"
                    variant="tonal"
                    closable
                    class="mb-6"
                    @click:close="errorMessage = ''"
                  >
                    {{ errorMessage }}
                  </VAlert>

                  <VForm @submit.prevent="handleSubmit">
                    <VTextField
                      v-model="email"
                      label="Correo electrónico"
                      type="email"
                      autocomplete="username"
                      prepend-inner-icon="mdi-email-outline"
                      variant="outlined"
                      color="primary"
                      :rules="emailRules"
                      class="mb-2"
                    />

                    <VTextField
                      v-model="password"
                      label="Contraseña"
                      :type="showPassword ? 'text' : 'password'"
                      autocomplete="current-password"
                      prepend-inner-icon="mdi-lock-outline"
                      :append-inner-icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
                      variant="outlined"
                      color="primary"
                      :rules="passwordRules"
                      class="mb-4"
                      @click:append-inner="showPassword = !showPassword"
                    />

                    <VBtn
                      type="submit"
                      color="primary"
                      size="large"
                      block
                      :disabled="!canSubmit"
                      :loading="authStore.isLoading"
                    >
                      Ingresar al sistema
                    </VBtn>
                  </VForm>

                  <div class="form-panel__footer">
                    <VIcon icon="mdi-lock-outline" size="17" />
                    <span>Tus credenciales se transmiten de forma segura</span>
                  </div>
                </div>
              </VCol>
            </VRow>
          </VCard>
        </VCol>
      </VRow>
    </VContainer>
  </main>
</template>

<style scoped>
.login-page {
  position: relative;
  min-height: 100dvh;
  overflow: hidden;
  background:
    radial-gradient(circle at 15% 20%, rgba(47, 145, 140, 0.16), transparent 30%),
    linear-gradient(135deg, #eef4f6 0%, #f8fafb 55%, #edf3f5 100%);
}

.login-page__decoration {
  position: absolute;
  right: -180px;
  bottom: -240px;
  width: 560px;
  height: 560px;
  border: 90px solid rgba(23, 50, 77, 0.05);
  border-radius: 50%;
}

.login-container {
  position: relative;
  z-index: 1;
  display: flex;
  min-height: 100dvh;
  align-items: center;
  padding-top: 32px;
  padding-bottom: 32px;
}

.login-card {
  overflow: hidden;
  border: 1px solid rgba(23, 50, 77, 0.08);
}

.brand-panel {
  min-height: 560px;
  padding: 48px 40px;
  color: #ffffff;
  background: linear-gradient(155deg, rgba(47, 145, 140, 0.94), rgba(23, 50, 77, 0.98));
}

.brand-panel__eyebrow,
.form-panel__eyebrow {
  margin-bottom: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.brand-panel__eyebrow {
  color: rgba(255, 255, 255, 0.72);
}

.brand-panel__title {
  margin-bottom: 20px;
  font-size: clamp(2rem, 4vw, 2.8rem);
  line-height: 1.08;
}

.brand-panel__description {
  max-width: 340px;
  color: rgba(255, 255, 255, 0.82);
  font-size: 1rem;
  line-height: 1.7;
}

.brand-panel__security {
  display: flex;
  gap: 10px;
  align-items: center;
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.82rem;
}

.form-panel {
  display: flex;
  min-height: 560px;
  flex-direction: column;
  justify-content: center;
  padding: 48px;
}

.form-panel__eyebrow {
  color: #1f7a75;
}

.form-panel__title {
  margin-bottom: 10px;
  color: #17324d;
  font-size: 2rem;
}

.form-panel__description {
  color: #637381;
  line-height: 1.6;
}

.form-panel__footer {
  display: flex;
  gap: 7px;
  align-items: center;
  justify-content: center;
  margin-top: 28px;
  color: #637381;
  font-size: 0.78rem;
}

@media (max-width: 959px) {
  .brand-panel {
    min-height: auto;
    padding: 36px;
  }

  .brand-panel__security {
    margin-top: 36px;
  }

  .form-panel {
    min-height: auto;
    padding: 40px 36px;
  }
}

@media (max-width: 599px) {
  .login-container {
    padding: 16px;
  }

  .brand-panel,
  .form-panel {
    padding: 32px 24px;
  }
}
</style>
