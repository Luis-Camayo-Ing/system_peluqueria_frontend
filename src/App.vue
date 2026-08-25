<template>
  <v-app>
    <v-main class="bg-background">
      <v-container class="d-flex align-center justify-center py-12 fill-height">
        <v-row justify="center">
          <v-col cols="12" sm="10" md="8" lg="6">
            <v-card class="pa-8 text-center" elevation="3">
              <v-icon color="secondary" icon="mdi-content-cut" size="64" />

              <h1 class="text-h3 font-weight-bold text-primary mt-4">ERP Beauty Pro</h1>

              <p class="text-h6 text-medium-emphasis mt-3">
                Sistema integral para la gestión de peluquerías
              </p>

              <v-divider class="my-6" />

              <div class="d-flex flex-wrap justify-center ga-2">
                <v-chip color="primary" variant="tonal"> Vue 3 </v-chip>

                <v-chip color="secondary" variant="tonal"> TypeScript </v-chip>

                <v-chip color="info" variant="tonal"> Vuetify 4 </v-chip>

                <v-chip color="success" variant="tonal"> FastAPI </v-chip>
              </div>

              <v-alert
                class="mt-6 text-left"
                color="success"
                icon="mdi-check-circle"
                text="El frontend del ERP Beauty Pro se inicializó correctamente."
                title="Sprint 20"
                variant="tonal"
              />

              <v-btn class="mt-6" color="primary" prepend-icon="mdi-view-dashboard" size="large">
                Frontend inicializado
              </v-btn>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>
