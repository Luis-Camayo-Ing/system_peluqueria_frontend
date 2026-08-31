<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'

import { useAuthStore } from '@/stores/auth'
import { useOperationsStore } from '@/stores/operations'
import type {
  ApiRecord,
  FieldDefinition,
  ModuleDefinition,
  ResourceActionDefinition,
  ResourceDefinition,
} from '@/types/operations'
import { formatOperationValue, readOperationValue } from '@/utils/operations-formatters'

const props = defineProps<{
  module: ModuleDefinition
}>()

const authStore = useAuthStore()
const operationsStore = useOperationsStore()

const activeResourceKey = ref(props.module.resources[0]?.key ?? '')
const search = ref('')
const formDialog = ref(false)
const actionDialog = ref(false)
const resultDialog = ref(false)
const editingItem = ref<ApiRecord | null>(null)
const selectedItem = ref<ApiRecord | null>(null)
const selectedAction = ref<ResourceActionDefinition | null>(null)
const formRef = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null)
const actionFormRef = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null)
const form = reactive<Record<string, unknown>>({})
const actionForm = reactive<Record<string, unknown>>({})

const activeResource = computed<ResourceDefinition>(() => {
  return (props.module.resources.find((resource) => resource.key === activeResourceKey.value) ??
    props.module.resources[0]) as ResourceDefinition
})

const visibleFields = computed(() => {
  const editing = Boolean(editingItem.value)

  return activeResource.value.fields.filter((field) => {
    if (field.companyFromSession) return false
    if (editing && field.createOnly) return false
    if (!editing && field.editOnly) return false
    return true
  })
})

function inputType(field: FieldDefinition): string {
  if (field.kind === 'email' || field.kind === 'password' || field.kind === 'date') {
    return field.kind
  }
  if (field.kind === 'datetime-local') return 'datetime-local'
  if (field.kind === 'number') return 'number'
  return 'text'
}

function fieldOptions(field: FieldDefinition) {
  return field.options ?? operationsStore.remoteOptions[field.key] ?? []
}

function isProtected(item: ApiRecord): boolean {
  const key = activeResource.value.protectedFlagKey
  return key ? item[key] === true : false
}

function visibleActions(item: ApiRecord): ResourceActionDefinition[] {
  return (activeResource.value.actions ?? []).filter(
    (action) => !isProtected(item) || action.allowOnProtected,
  )
}

function itemLabel(item: ApiRecord): string {
  return String(item.name ?? item.email ?? item.id ?? activeResource.value.singular)
}

function requiredRule(field: FieldDefinition) {
  return field.required
    ? [(value: unknown) => Boolean(value) || `${field.label} es obligatorio`]
    : []
}

function resetObject(target: Record<string, unknown>): void {
  for (const key of Object.keys(target)) delete target[key]
}

function setDefaultValues(target: Record<string, unknown>, fields: FieldDefinition[]): void {
  resetObject(target)
  for (const field of fields) {
    if (field.companyFromSession) {
      target[field.key] = authStore.companyId
      continue
    }

    const value = field.defaultValue
    target[field.key] = field.kind === 'json' ? JSON.stringify(value ?? [], null, 2) : (value ?? '')
  }
}

function setEditValues(item: ApiRecord): void {
  resetObject(form)
  for (const field of activeResource.value.fields) {
    if (field.companyFromSession) continue
    const value = item[field.key]
    form[field.key] = field.kind === 'json' ? JSON.stringify(value ?? [], null, 2) : (value ?? '')
  }
}

function normalizeValues(
  source: Record<string, unknown>,
  fields: FieldDefinition[],
): Record<string, unknown> {
  const values: Record<string, unknown> = {}

  for (const field of fields) {
    if (field.companyFromSession) {
      values[field.key] = authStore.companyId
      continue
    }

    const value = source[field.key]

    if (field.kind === 'json') {
      try {
        values[field.key] = JSON.parse(String(value || '[]')) as unknown
      } catch {
        throw new Error(`${field.label} debe contener JSON válido`)
      }
    } else if (field.kind === 'datetime-local' && value) {
      const dateTime = String(value)
      values[field.key] = /(?:Z|[+-]\d{2}:\d{2})$/.test(dateTime)
        ? dateTime
        : new Date(dateTime).toISOString()
    } else {
      values[field.key] = value
    }
  }

  return values
}

async function load(): Promise<void> {
  operationsStore.clearMessages()
  await operationsStore.load(activeResource.value, authStore.companyId, search.value)
}

async function changeResource(): Promise<void> {
  search.value = ''
  operationsStore.clearMessages()
  await Promise.all([
    operationsStore.load(activeResource.value, authStore.companyId),
    operationsStore.loadFieldOptions(activeResource.value, authStore.companyId),
  ])
}

async function openCreate(): Promise<void> {
  editingItem.value = null
  setDefaultValues(form, activeResource.value.fields)
  await operationsStore.loadFieldOptions(activeResource.value, authStore.companyId)
  formDialog.value = true
}

async function openEdit(item: ApiRecord): Promise<void> {
  editingItem.value = item
  setEditValues(item)
  await operationsStore.loadFieldOptions(activeResource.value, authStore.companyId)
  formDialog.value = true
}

async function save(): Promise<void> {
  const validation = await formRef.value?.validate()
  if (validation && !validation.valid) return

  try {
    const values = normalizeValues(form, activeResource.value.fields)
    const saved = await operationsStore.save(activeResource.value, values, {
      companyId: authStore.companyId,
      id: editingItem.value?.id ? String(editingItem.value.id) : undefined,
    })

    if (!saved) return
    formDialog.value = false
    await load()
  } catch (error: unknown) {
    operationsStore.errorMessage = error instanceof Error ? error.message : 'Formulario inválido'
  }
}

async function remove(item: ApiRecord): Promise<void> {
  const accepted = window.confirm(
    `¿Confirmas la acción ${activeResource.value.deleteLabel?.toLowerCase() ?? 'eliminar'} sobre este registro?`,
  )
  if (!accepted) return

  const removed = await operationsStore.remove(activeResource.value, item, authStore.companyId)
  if (removed) await load()
}

async function prepareAction(action: ResourceActionDefinition, item: ApiRecord): Promise<void> {
  selectedAction.value = action
  selectedItem.value = item

  if (action.confirmMessage && !window.confirm(action.confirmMessage)) return

  if (action.fields?.length) {
    setDefaultValues(actionForm, action.fields)
    actionDialog.value = true
    return
  }

  const completed = await operationsStore.runAction(action, item)
  if (completed && operationsStore.actionResult) resultDialog.value = true
  if (completed) await load()
}

async function executeAction(): Promise<void> {
  if (!selectedAction.value || !selectedItem.value) return

  const validation = await actionFormRef.value?.validate()
  if (validation && !validation.valid) return

  try {
    const values = normalizeValues(actionForm, selectedAction.value.fields ?? [])
    const completed = await operationsStore.runAction(
      selectedAction.value,
      selectedItem.value,
      values,
    )
    if (!completed) return
    actionDialog.value = false
    if (operationsStore.actionResult) resultDialog.value = true
    await load()
  } catch (error: unknown) {
    operationsStore.errorMessage = error instanceof Error ? error.message : 'Formulario inválido'
  }
}

function actionResultText(): string {
  return JSON.stringify(operationsStore.actionResult, null, 2)
}

watch(
  () => props.module.key,
  () => {
    activeResourceKey.value = props.module.resources[0]?.key ?? ''
    void changeResource()
  },
)

watch(activeResourceKey, () => void changeResource())
onMounted(() => void changeResource())
</script>

<template>
  <VContainer fluid class="operations-page pa-4 pa-md-7">
    <header class="operations-header">
      <div>
        <p class="operations-header__eyebrow">{{ module.sprint }}</p>
        <h1>{{ module.title }}</h1>
        <p>{{ module.subtitle }}</p>
      </div>
      <VAvatar color="secondary" variant="tonal" size="56">
        <VIcon :icon="module.icon" size="30" />
      </VAvatar>
    </header>

    <VAlert
      v-if="operationsStore.errorMessage"
      type="error"
      variant="tonal"
      closable
      class="mb-4"
      @click:close="operationsStore.errorMessage = null"
    >
      {{ operationsStore.errorMessage }}
    </VAlert>
    <VAlert
      v-if="operationsStore.successMessage"
      type="success"
      variant="tonal"
      closable
      class="mb-4"
      @click:close="operationsStore.successMessage = null"
    >
      {{ operationsStore.successMessage }}
    </VAlert>

    <VCard rounded="xl" border elevation="0">
      <VTabs v-model="activeResourceKey" color="secondary" class="px-3">
        <VTab v-for="resource in module.resources" :key="resource.key" :value="resource.key">
          <VIcon :icon="resource.icon" start />
          {{ resource.title }}
        </VTab>
      </VTabs>
      <VDivider />

      <VCardText class="pa-4 pa-md-6">
        <div class="resource-heading">
          <div>
            <h2>{{ activeResource.title }}</h2>
            <p>{{ activeResource.description }}</p>
          </div>
          <div class="resource-heading__actions">
            <VTextField
              v-model="search"
              label="Buscar"
              prepend-inner-icon="mdi-magnify"
              density="compact"
              hide-details
              clearable
              max-width="260"
              @keyup.enter="load"
            />
            <VBtn icon="mdi-refresh" variant="tonal" aria-label="Actualizar" @click="load" />
            <VBtn
              v-if="activeResource.createPath && !activeResource.readOnly"
              color="primary"
              prepend-icon="mdi-plus"
              @click="openCreate"
            >
              Crear
            </VBtn>
          </div>
        </div>

        <VProgressLinear v-if="operationsStore.isLoading" indeterminate color="secondary" />

        <div
          v-if="!operationsStore.isLoading && operationsStore.items.length === 0"
          class="empty-state"
        >
          <VIcon :icon="activeResource.icon" size="42" />
          <strong>No hay registros</strong>
          <span>Crea el primer registro o ajusta el criterio de búsqueda.</span>
        </div>

        <div v-else class="table-wrapper">
          <VTable density="comfortable" hover>
            <thead>
              <tr>
                <th v-for="column in activeResource.columns" :key="column.key">
                  {{ column.label }}
                </th>
                <th class="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in operationsStore.items" :key="String(item.id)">
                <td v-for="column in activeResource.columns" :key="column.key">
                  {{ formatOperationValue(readOperationValue(item, column.key), column) }}
                </td>
                <td class="actions-cell">
                  <VBtn
                    v-if="activeResource.updatePath && !isProtected(item)"
                    icon="mdi-pencil-outline"
                    size="small"
                    variant="text"
                    :aria-label="`Editar ${itemLabel(item)}`"
                    @click="openEdit(item)"
                  />
                  <VBtn
                    v-for="action in visibleActions(item)"
                    :key="action.key"
                    :icon="action.icon"
                    :color="action.color"
                    size="small"
                    variant="text"
                    :aria-label="`${action.label} ${itemLabel(item)}`"
                    @click="prepareAction(action, item)"
                  />
                  <VBtn
                    v-if="activeResource.deletePath && !isProtected(item)"
                    icon="mdi-power"
                    color="error"
                    size="small"
                    variant="text"
                    :aria-label="`${activeResource.deleteLabel ?? 'Eliminar'} ${itemLabel(item)}`"
                    @click="remove(item)"
                  />
                </td>
              </tr>
            </tbody>
          </VTable>
        </div>

        <div class="resource-footer">
          <span
            >{{ operationsStore.total }} registro{{ operationsStore.total === 1 ? '' : 's' }}</span
          >
        </div>
      </VCardText>
    </VCard>

    <VDialog v-model="formDialog" max-width="840" scrollable>
      <VCard rounded="xl">
        <VCardTitle class="dialog-title">
          {{ editingItem ? 'Editar' : 'Crear' }} {{ activeResource.singular }}
        </VCardTitle>
        <VForm ref="formRef" @submit.prevent="save">
          <VCardText>
            <VRow>
              <VCol
                v-for="field in visibleFields"
                :key="`${field.key}-${field.label}`"
                cols="12"
                :md="field.kind === 'textarea' || field.kind === 'json' ? 12 : 6"
              >
                <VSwitch
                  v-if="field.kind === 'switch'"
                  v-model="form[field.key]"
                  :label="field.label"
                  color="secondary"
                  hide-details
                />
                <VSelect
                  v-else-if="field.kind === 'select'"
                  v-model="form[field.key]"
                  :label="field.label"
                  :items="fieldOptions(field)"
                  :rules="requiredRule(field)"
                  clearable
                />
                <VTextarea
                  v-else-if="field.kind === 'textarea' || field.kind === 'json'"
                  v-model="form[field.key]"
                  :label="field.label"
                  :rows="field.rows ?? 3"
                  :rules="requiredRule(field)"
                  :hint="field.help"
                  persistent-hint
                  :class="{ 'json-field': field.kind === 'json' }"
                />
                <VTextField
                  v-else
                  v-model="form[field.key]"
                  :label="field.label"
                  :type="inputType(field)"
                  :rules="requiredRule(field)"
                  :hint="field.help"
                  persistent-hint
                />
              </VCol>
            </VRow>
          </VCardText>
          <VCardActions class="pa-4">
            <VSpacer />
            <VBtn variant="text" @click="formDialog = false">Cancelar</VBtn>
            <VBtn color="primary" type="submit" :loading="operationsStore.isSaving"> Guardar </VBtn>
          </VCardActions>
        </VForm>
      </VCard>
    </VDialog>

    <VDialog v-model="actionDialog" max-width="620">
      <VCard rounded="xl">
        <VCardTitle class="dialog-title">{{ selectedAction?.label }}</VCardTitle>
        <VForm ref="actionFormRef" @submit.prevent="executeAction">
          <VCardText>
            <template v-for="field in selectedAction?.fields" :key="field.key">
              <VTextarea
                v-if="field.kind === 'textarea' || field.kind === 'json'"
                v-model="actionForm[field.key]"
                :label="field.label"
                :rows="field.rows ?? 3"
                :rules="requiredRule(field)"
                class="mb-2"
              />
              <VTextField
                v-else
                v-model="actionForm[field.key]"
                :label="field.label"
                :type="inputType(field)"
                :rules="requiredRule(field)"
                class="mb-2"
              />
            </template>
          </VCardText>
          <VCardActions class="pa-4">
            <VSpacer />
            <VBtn variant="text" @click="actionDialog = false">Cancelar</VBtn>
            <VBtn color="primary" type="submit" :loading="operationsStore.isSaving">
              Confirmar
            </VBtn>
          </VCardActions>
        </VForm>
      </VCard>
    </VDialog>

    <VDialog v-model="resultDialog" max-width="760">
      <VCard rounded="xl">
        <VCardTitle class="dialog-title">Resultado de la operación</VCardTitle>
        <VCardText>
          <pre class="result-output">{{ actionResultText() }}</pre>
        </VCardText>
        <VCardActions><VSpacer /><VBtn @click="resultDialog = false">Cerrar</VBtn></VCardActions>
      </VCard>
    </VDialog>
  </VContainer>
</template>

<style scoped>
.operations-page {
  max-width: 1600px;
}

.operations-header,
.resource-heading,
.resource-heading__actions,
.resource-footer {
  display: flex;
  align-items: center;
}

.operations-header {
  justify-content: space-between;
  margin-bottom: 24px;
}

.operations-header h1 {
  margin: 0;
  color: #17324d;
  font-size: clamp(2rem, 4vw, 3rem);
}

.operations-header p,
.resource-heading p {
  margin: 4px 0 0;
  color: #637381;
}

.operations-header__eyebrow {
  color: #1f7a75 !important;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.resource-heading {
  gap: 20px;
  justify-content: space-between;
  margin-bottom: 18px;
}

.resource-heading h2 {
  margin: 0;
  color: #17324d;
}

.resource-heading__actions {
  gap: 8px;
}

.resource-heading__actions :deep(.v-text-field) {
  min-width: 240px;
}

.table-wrapper {
  overflow-x: auto;
  border: 1px solid #e2e8ec;
  border-radius: 14px;
}

.table-wrapper th {
  color: #52616f;
  font-size: 0.72rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  white-space: nowrap;
}

.table-wrapper td {
  min-width: 120px;
  color: #243746;
}

.actions-cell {
  min-width: 130px !important;
  text-align: right;
  white-space: nowrap;
}

.empty-state {
  display: grid;
  min-height: 260px;
  color: #637381;
  place-items: center;
  align-content: center;
  gap: 8px;
}

.resource-footer {
  justify-content: flex-end;
  padding-top: 14px;
  color: #637381;
  font-size: 0.8rem;
}

.dialog-title {
  padding: 22px 24px 10px;
  color: #17324d;
  font-weight: 800;
}

.json-field :deep(textarea),
.result-output {
  font-family: Consolas, 'Courier New', monospace;
}

.result-output {
  overflow: auto;
  max-height: 460px;
  padding: 16px;
  color: #dcebf0;
  background: #17324d;
  border-radius: 12px;
  white-space: pre-wrap;
}

@media (max-width: 900px) {
  .resource-heading {
    align-items: stretch;
    flex-direction: column;
  }

  .resource-heading__actions {
    flex-wrap: wrap;
  }

  .resource-heading__actions :deep(.v-text-field) {
    width: 100%;
  }
}
</style>
