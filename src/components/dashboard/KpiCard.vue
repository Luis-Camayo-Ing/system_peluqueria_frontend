<script setup lang="ts">
defineProps<{
  title: string
  value: string
  subtitle: string
  icon: string
  color: string
}>()
</script>

<template>
  <VCard class="kpi-card" elevation="0">
    <VCardText class="pa-5">
      <div class="kpi-card__top">
        <VAvatar :color="color" variant="tonal" size="46">
          <VIcon :icon="icon" size="24" />
        </VAvatar>
        <VIcon icon="mdi-arrow-top-right" size="18" color="grey" />
      </div>
      <p class="kpi-card__title">{{ title }}</p>
      <strong class="kpi-card__value">{{ value }}</strong>
      <p class="kpi-card__subtitle">{{ subtitle }}</p>
    </VCardText>
  </VCard>
</template>

<style scoped>
.kpi-card {
  height: 100%;
  border: 1px solid #dde5ea;
  border-radius: 18px;
}

.kpi-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.kpi-card__title,
.kpi-card__subtitle {
  margin: 0;
  color: #687886;
}

.kpi-card__title {
  font-size: 0.86rem;
}

.kpi-card__value {
  display: block;
  margin: 6px 0;
  color: #0c3153;
  font-size: clamp(1.35rem, 2vw, 1.75rem);
  line-height: 1.15;
}

.kpi-card__subtitle {
  font-size: 0.78rem;
}
</style>
