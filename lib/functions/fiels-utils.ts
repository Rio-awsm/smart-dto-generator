import { DTOSchema, Field } from "@/types/schema"


export function createNewField(): Field {
  return {
    id: Math.random().toString(36).substr(2, 9),
    name: "",
    type: "string",
    required: false,
    unique: false,
    isExpanded: true,
  }
}

export function updateFieldInSchema(schema: DTOSchema, fieldId: string, updates: Partial<Field>): DTOSchema {
  const updateFieldInArray = (fields: Field[]): Field[] => {
    return fields.map((field) => {
      if (field.id === fieldId) {
        const updatedField = { ...field, ...updates }
        if (updates.type === "object" && !updatedField.nestedFields) {
          updatedField.nestedFields = []
        }
        if (updates.type === "enum" && !updatedField.enum) {
          updatedField.enum = [{ key: "", value: "" }]
        }
        if (updates.type === "array" && updates.arrayType === "object" && !updatedField.nestedFields) {
          updatedField.nestedFields = []
        }
        return updatedField
      }
      if (field.nestedFields) {
        return { ...field, nestedFields: updateFieldInArray(field.nestedFields) }
      }
      return field
    })
  }

  return {
    ...schema,
    fields: updateFieldInArray(schema.fields),
  }
}

export function removeFieldFromSchema(schema: DTOSchema, fieldId: string, parentFields?: Field[]): DTOSchema {
  if (parentFields) {
    const updateNestedFields = (fields: Field[]): Field[] => {
      return fields.map((field) => {
        if (field.nestedFields === parentFields) {
          return { ...field, nestedFields: parentFields.filter((f) => f.id !== fieldId) }
        }
        if (field.nestedFields) {
          return { ...field, nestedFields: updateNestedFields(field.nestedFields) }
        }
        return field
      })
    }

    return {
      ...schema,
      fields: updateNestedFields(schema.fields),
    }
  } else {
    return {
      ...schema,
      fields: schema.fields.filter((f) => f.id !== fieldId),
    }
  }
}
