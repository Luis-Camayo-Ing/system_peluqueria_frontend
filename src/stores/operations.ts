import { defineStore } from 'pinia'
import { ref } from 'vue'

import { interpolateOperationPath, operationsService } from '@/services/operations.service'
import type {
  ApiRecord,
  ResourceActionDefinition,
  ResourceDefinition,
  SelectOption,
} from '@/types/operations'
import { getApiErrorMessage } from '@/utils/api-error'

interface SaveContext {
  companyId: string | null
  id?: string
}

function makeContext(
  values: Record<string, unknown>,
  companyId: string | null,
  id?: string,
): Record<string, unknown> {
  return {
    ...values,
    id,
    company_id: companyId,
  }
}

function cleanPayload(
  resource: ResourceDefinition,
  values: Record<string, unknown>,
): Record<string, unknown> {
  const pathOnlyKeys = new Set(
    resource.fields.filter((field) => field.pathOnly).map((field) => field.key),
  )

  return Object.fromEntries(
    Object.entries(values).filter(([key, value]) => {
      if (pathOnlyKeys.has(key) || value === undefined) return false
      return value !== ''
    }),
  )
}

export const useOperationsStore = defineStore('operations', () => {
  const items = ref<ApiRecord[]>([])
  const total = ref(0)
  const isLoading = ref(false)
  const isSaving = ref(false)
  const errorMessage = ref<string | null>(null)
  const successMessage = ref<string | null>(null)
  const actionResult = ref<unknown>(null)
  const remoteOptions = ref<Record<string, SelectOption[]>>({})

  async function load(
    resource: ResourceDefinition,
    companyId: string | null,
    search = '',
  ): Promise<void> {
    isLoading.value = true
    errorMessage.value = null

    try {
      const path = interpolateOperationPath(resource.listPath, {
        company_id: companyId,
      })
      const query: Record<string, unknown> = {
        ...resource.defaultQuery,
      }

      if (resource.companyQueryKey && companyId) {
        query[resource.companyQueryKey] = companyId
      }

      if (search.trim()) query.search = search.trim()

      const result = await operationsService.list(path, query)
      items.value = result.items
      total.value = result.total
    } catch (error: unknown) {
      items.value = []
      total.value = 0
      errorMessage.value = getApiErrorMessage(
        error,
        `No fue posible cargar ${resource.title.toLowerCase()}`,
      )
    } finally {
      isLoading.value = false
    }
  }

  async function loadFieldOptions(
    resource: ResourceDefinition,
    companyId: string | null,
  ): Promise<void> {
    const fields = resource.fields.filter((field) => field.optionsPath)

    await Promise.all(
      fields.map(async (field) => {
        const path = interpolateOperationPath(field.optionsPath ?? '', {
          company_id: companyId,
        })
        const result = await operationsService.list(path)
        const labelKeys = field.optionLabelKeys ?? ['name']

        remoteOptions.value[field.key] = result.items.map((item) => ({
          value: String(item.id ?? ''),
          title:
            labelKeys
              .map((key) => item[key])
              .filter((value) => value !== null && value !== undefined && String(value).trim())
              .join(' ') || String(item.id ?? 'Sin nombre'),
        }))
      }),
    )
  }

  async function save(
    resource: ResourceDefinition,
    values: Record<string, unknown>,
    context: SaveContext,
  ): Promise<boolean> {
    const isEditing = Boolean(context.id)
    const template = isEditing ? resource.updatePath : resource.createPath

    if (!template) return false

    isSaving.value = true
    errorMessage.value = null
    successMessage.value = null

    try {
      const fullContext = makeContext(values, context.companyId, context.id)
      const path = interpolateOperationPath(template, fullContext)
      const method = isEditing ? (resource.updateMethod ?? 'patch') : 'post'
      await operationsService.request(method, path, cleanPayload(resource, values))
      successMessage.value = `${resource.singular.charAt(0).toUpperCase()}${resource.singular.slice(1)} guardado correctamente`
      return true
    } catch (error: unknown) {
      errorMessage.value = getApiErrorMessage(
        error,
        `No fue posible guardar el ${resource.singular}`,
      )
      return false
    } finally {
      isSaving.value = false
    }
  }

  async function remove(
    resource: ResourceDefinition,
    item: ApiRecord,
    companyId: string | null,
  ): Promise<boolean> {
    if (!resource.deletePath) return false

    isSaving.value = true
    errorMessage.value = null

    try {
      const path = interpolateOperationPath(resource.deletePath, {
        ...item,
        id: item.id,
        company_id: companyId,
      })
      await operationsService.request('delete', path)
      successMessage.value = `${resource.singular.charAt(0).toUpperCase()}${resource.singular.slice(1)} actualizado correctamente`
      return true
    } catch (error: unknown) {
      errorMessage.value = getApiErrorMessage(
        error,
        `No fue posible actualizar el ${resource.singular}`,
      )
      return false
    } finally {
      isSaving.value = false
    }
  }

  async function runAction(
    action: ResourceActionDefinition,
    item: ApiRecord,
    values: Record<string, unknown> = {},
  ): Promise<boolean> {
    isSaving.value = true
    errorMessage.value = null
    actionResult.value = null

    try {
      const path = interpolateOperationPath(action.path, { ...item, id: item.id, ...values })
      const payload = action.itemIdPayloadKey
        ? { ...values, [action.itemIdPayloadKey]: item.id }
        : values

      if (action.download) {
        const blob = await operationsService.download(path)
        const url = URL.createObjectURL(blob)
        const anchor = document.createElement('a')
        anchor.href = url
        anchor.download = `comprobante-${String(item.sale_number ?? item.id ?? 'venta')}.pdf`
        anchor.click()
        URL.revokeObjectURL(url)
      } else {
        actionResult.value = await operationsService.request(action.method, path, payload)
      }

      successMessage.value = `${action.label} completado correctamente`
      return true
    } catch (error: unknown) {
      errorMessage.value = getApiErrorMessage(
        error,
        `No fue posible ejecutar ${action.label.toLowerCase()}`,
      )
      return false
    } finally {
      isSaving.value = false
    }
  }

  function clearMessages(): void {
    errorMessage.value = null
    successMessage.value = null
    actionResult.value = null
  }

  return {
    items,
    total,
    isLoading,
    isSaving,
    errorMessage,
    successMessage,
    actionResult,
    remoteOptions,
    load,
    loadFieldOptions,
    save,
    remove,
    runAction,
    clearMessages,
  }
})
