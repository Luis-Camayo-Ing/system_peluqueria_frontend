import axios from 'axios'

interface ValidationErrorItem {
  msg?: string
}

interface ApiErrorBody {
  detail?: string | ValidationErrorItem[]
}

export function getApiErrorMessage(
  error: unknown,
  fallbackMessage = 'Ocurrió un error inesperado',
): string {
  if (!axios.isAxiosError<ApiErrorBody>(error)) {
    return error instanceof Error ? error.message : fallbackMessage
  }

  if (!error.response) {
    return 'No fue posible conectar con el servidor'
  }

  const detail = error.response.data?.detail

  if (typeof detail === 'string' && detail.trim()) {
    return detail
  }

  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => item.msg)
      .filter((message): message is string => typeof message === 'string' && message.length > 0)

    if (messages.length > 0) {
      return messages.join('. ')
    }
  }

  if (error.response.status === 401) {
    return 'Correo o contraseña incorrectos'
  }

  if (error.response.status === 403) {
    return 'No tienes permiso para realizar esta acción'
  }

  return fallbackMessage
}
