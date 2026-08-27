<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import OperationsWorkbench from '@/components/operations/OperationsWorkbench.vue'
import { getOperationModule } from '@/config/operations'

const route = useRoute()

const moduleDefinition = computed(() => {
  const key = String(route.meta.operationsModule ?? '')
  const module = getOperationModule(key)

  if (!module) throw new Error(`No existe configuración para el módulo ${key}`)
  return module
})
</script>

<template>
  <OperationsWorkbench :module="moduleDefinition" />
</template>
