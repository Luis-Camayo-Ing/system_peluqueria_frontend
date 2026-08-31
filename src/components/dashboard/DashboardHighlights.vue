<script setup lang="ts">
import type { DashboardTopProduct, TopCustomer, TopService } from '@/types/dashboard'
import { formatCurrency, formatInteger, formatNumber } from '@/utils/dashboard-formatters'

defineProps<{
  products: DashboardTopProduct[]
  services: TopService[]
  customers: TopCustomer[]
}>()
</script>

<template>
  <VRow>
    <VCol cols="12" xl="4">
      <VCard class="highlight-card" elevation="0">
        <VCardTitle class="highlight-card__title">
          <VAvatar color="primary" variant="tonal" size="38">
            <VIcon icon="mdi-package-variant-closed" size="20" />
          </VAvatar>
          Productos destacados
        </VCardTitle>
        <VCardText>
          <div v-if="products.length" class="ranking-list">
            <div
              v-for="(product, index) in products"
              :key="product.product_id"
              class="ranking-item"
            >
              <span class="ranking-item__position">{{ index + 1 }}</span>
              <div>
                <strong>{{ product.name }}</strong>
                <small> {{ product.code }} · {{ formatNumber(product.quantity) }} uds. </small>
              </div>
              <strong>{{ formatCurrency(product.revenue) }}</strong>
            </div>
          </div>
          <div v-else class="highlight-empty">Sin productos vendidos.</div>
        </VCardText>
      </VCard>
    </VCol>

    <VCol cols="12" xl="4">
      <VCard class="highlight-card" elevation="0">
        <VCardTitle class="highlight-card__title">
          <VAvatar color="secondary" variant="tonal" size="38">
            <VIcon icon="mdi-content-cut" size="20" />
          </VAvatar>
          Servicios destacados
        </VCardTitle>
        <VCardText>
          <div v-if="services.length" class="ranking-list">
            <div
              v-for="(service, index) in services"
              :key="service.service_id"
              class="ranking-item"
            >
              <span class="ranking-item__position">{{ index + 1 }}</span>
              <div>
                <strong>{{ service.service_name }}</strong>
                <small>
                  {{ formatNumber(service.quantity) }} servicios ·
                  {{ formatInteger(service.sales_count) }} ventas
                </small>
              </div>
              <strong>{{ formatCurrency(service.revenue) }}</strong>
            </div>
          </div>
          <div v-else class="highlight-empty">Sin servicios vendidos.</div>
        </VCardText>
      </VCard>
    </VCol>

    <VCol cols="12" xl="4">
      <VCard class="highlight-card" elevation="0">
        <VCardTitle class="highlight-card__title">
          <VAvatar color="info" variant="tonal" size="38">
            <VIcon icon="mdi-account-star-outline" size="20" />
          </VAvatar>
          Mejores clientes
        </VCardTitle>
        <VCardText>
          <div v-if="customers.length" class="ranking-list">
            <div
              v-for="(customer, index) in customers"
              :key="customer.customer_id"
              class="ranking-item"
            >
              <span class="ranking-item__position">{{ index + 1 }}</span>
              <div>
                <strong>{{ customer.customer_name }}</strong>
                <small> {{ formatInteger(customer.purchases_count) }} compras </small>
              </div>
              <strong>{{ formatCurrency(customer.total_spent) }}</strong>
            </div>
          </div>
          <div v-else class="highlight-empty">Sin compras de clientes.</div>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<style scoped>
.highlight-card {
  height: 100%;
  border: 1px solid #dde5ea;
  border-radius: 18px;
}

.highlight-card__title {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 20px 10px;
  color: #0c3153;
  font-size: 1rem;
  font-weight: 700;
}

.ranking-list {
  display: grid;
  gap: 4px;
}

.ranking-item {
  display: grid;
  grid-template-columns: 30px minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  padding: 12px 0;
  border-bottom: 1px solid #edf1f3;
}

.ranking-item:last-child {
  border-bottom: 0;
}

.ranking-item__position {
  width: 26px;
  height: 26px;
  display: grid;
  place-content: center;
  border-radius: 8px;
  background: #eef5f5;
  color: #287d7a;
  font-size: 0.75rem;
  font-weight: 800;
}

.ranking-item div {
  min-width: 0;
}

.ranking-item strong {
  color: #17324d;
  font-size: 0.82rem;
}

.ranking-item div strong,
.ranking-item small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ranking-item small {
  margin-top: 3px;
  color: #637381;
  font-size: 0.72rem;
}

.highlight-empty {
  min-height: 150px;
  display: grid;
  place-content: center;
  color: #637381;
  text-align: center;
}
</style>
