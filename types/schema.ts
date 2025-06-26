export type FieldType =
  | "string"
  | "number"
  | "boolean"
  | "Date"
  | "ObjectId"
  | "array"
  | "object"
  | "enum"
  | "mixed"
  | "Buffer"
  | "Map"
  | "Decimal128"

export interface ValidationRule {
  type: "min" | "max" | "minLength" | "maxLength" | "match" | "validate" | "custom"
  value: string | number
  message?: string
}

export interface IndexDefinition {
  fields: string[]
  type: "single" | "compound" | "text" | "2dsphere" | "hashed"
  unique?: boolean
  sparse?: boolean
  background?: boolean
}

export interface EnumValue {
  key: string
  value: string
  description?: string
}

export interface Field {
  id: string
  name: string
  type: FieldType
  required: boolean
  unique: boolean
  index?: boolean
  sparse?: boolean
  default?: string
  ref?: string
  refPath?: string
  populate?: boolean
  select?: boolean
  transform?: string
  alias?: string
  immutable?: boolean
  validation?: ValidationRule[]
  enum?: EnumValue[]
  arrayType?: FieldType
  arrayRef?: string
  arrayMinItems?: number
  arrayMaxItems?: number
  nestedFields?: Field[]
  description?: string
  example?: string
  deprecated?: boolean
  virtual?: boolean
  getter?: string
  setter?: string
  isExpanded?: boolean
}

export interface DTOSchema {
  name: string
  fields: Field[]
  imports: string[]
  enums: { name: string; values: EnumValue[]; description?: string }[]
  indexes?: IndexDefinition[]
  options: {
    timestamps: boolean
    versionKey: boolean
    collection?: string
    discriminatorKey?: string
    strict: boolean
    validateBeforeSave: boolean
    autoIndex: boolean
  }
  hooks: {
    pre: string[]
    post: string[]
  }
  virtuals: string[]
  methods: string[]
  statics: string[]
}
