export type ApiRecord = Record<string, unknown>

export type FieldKind =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'textarea'
  | 'switch'
  | 'select'
  | 'date'
  | 'datetime-local'
  | 'json'

export type ColumnFormat = 'text' | 'money' | 'boolean' | 'date' | 'datetime' | 'status' | 'count'

export interface SelectOption {
  title: string
  value: string | number | boolean
}

export interface FieldDefinition {
  key: string
  label: string
  kind?: FieldKind
  required?: boolean
  defaultValue?: unknown
  options?: SelectOption[]
  optionsPath?: string
  optionLabelKeys?: string[]
  help?: string
  placeholder?: string
  companyFromSession?: boolean
  pathOnly?: boolean
  createOnly?: boolean
  editOnly?: boolean
  rows?: number
}

export interface ColumnDefinition {
  key: string
  label: string
  format?: ColumnFormat
}

export interface ResourceActionDefinition {
  key: string
  label: string
  icon: string
  color?: string
  method: 'get' | 'post' | 'patch' | 'delete'
  path: string
  fields?: FieldDefinition[]
  confirmMessage?: string
  download?: boolean
  itemIdPayloadKey?: string
}

export interface ResourceDefinition {
  key: string
  title: string
  singular: string
  icon: string
  description: string
  listPath: string
  createPath?: string
  updatePath?: string
  updateMethod?: 'put' | 'patch'
  deletePath?: string
  deleteLabel?: string
  columns: ColumnDefinition[]
  fields: FieldDefinition[]
  actions?: ResourceActionDefinition[]
  defaultQuery?: Record<string, unknown>
  companyQueryKey?: string
  readOnly?: boolean
  protectedFlagKey?: string
}

export interface ModuleDefinition {
  key: string
  title: string
  subtitle: string
  icon: string
  sprint: string
  resources: ResourceDefinition[]
}

export interface ResourceResult {
  total: number
  items: ApiRecord[]
}

export interface ReportSection {
  key: string
  title: string
  value: unknown
}
