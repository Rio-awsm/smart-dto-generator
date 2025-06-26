import { DTOSchema, Field } from "@/types/schema";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export async function generateSchemaWithAI(prompt: string): Promise<DTOSchema> {
  const systemPrompt = `You are an expert TypeScript and MongoDB schema designer. Generate a comprehensive DTO schema based on the user's requirements.

Return a JSON object with the following structure:
{
  "name": "SchemaName",
  "fields": [
    {
      "id": "unique_id",
      "name": "fieldName",
      "type": "string|number|boolean|Date|ObjectId|array|object|enum|mixed|Buffer|Map|Decimal128",
      "required": true|false,
      "unique": true|false,
      "index": true|false,
      "description": "Field description",
      "default": "default value if any",
      "ref": "Reference model if ObjectId",
      "arrayType": "type if array",
      "nestedFields": [...] // if object or array of objects,
      "enum": [{"key": "KEY", "value": "value"}] // if enum type,
      "validation": [{"type": "min|max|minLength|maxLength", "value": number|string}]
    }
  ],
  "imports": [],
  "enums": [],
  "indexes": [],
  "options": {
    "timestamps": true,
    "versionKey": false,
    "strict": true,
    "validateBeforeSave": true,
    "autoIndex": true
  },
  "hooks": {"pre": [], "post": []},
  "virtuals": [],
  "methods": [],
  "statics": []
}

Guidelines:
- Use appropriate field types for the use case
- Add comprehensive validation rules
- Include proper relationships with ObjectId references
- Add indexes for frequently queried fields
- Use descriptive field names and descriptions
- Include nested objects where appropriate
- Add enums for predefined values
- Consider performance and best practices`;

  try {
    const fullPrompt = `${systemPrompt}\n\nGenerate a DTO schema for: ${prompt}`;
    
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No valid JSON found in AI response");
    }

    const schemaData = JSON.parse(jsonMatch[0]);

    const addIdsToFields = (fields: any[]): Field[] => {
      return fields.map((field) => ({
        ...field,
        id: field.id || Math.random().toString(36).substr(2, 9),
        isExpanded: true,
        nestedFields: field.nestedFields
          ? addIdsToFields(field.nestedFields)
          : undefined,
      }));
    };

    return {
      ...schemaData,
      fields: addIdsToFields(schemaData.fields || []),
    };
  } catch (error) {
    console.error("AI Schema Generation Error:", error);
    throw new Error("Failed to generate schema with AI. Please try again.");
  }
}

export async function improveSchemaWithAI(
  currentSchema: DTOSchema
): Promise<DTOSchema> {
  const systemPrompt = `You are an expert TypeScript and MongoDB schema designer. Analyze the provided schema and improve it by:

1. Adding missing fields that would be common for this type of schema
2. Optimizing field types and constraints
3. Adding appropriate validation rules
4. Suggesting indexes for performance
5. Adding documentation and examples
6. Implementing best practices
7. Adding relationships where appropriate

Return the improved schema in the same JSON format as provided, but enhanced.`;

  try {
    const fullPrompt = `${systemPrompt}\n\nImprove this schema:\n${JSON.stringify(currentSchema, null, 2)}`;
    
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No valid JSON found in AI response");
    }

    const improvedSchema = JSON.parse(jsonMatch[0]);

    const preserveIds = (
      newFields: any[],
      existingFields: Field[]
    ): Field[] => {
      return newFields.map((newField) => {
        const existing = existingFields.find((f) => f.name === newField.name);
        return {
          ...newField,
          id: existing?.id || Math.random().toString(36).substr(2, 9),
          isExpanded: existing?.isExpanded ?? true,
          nestedFields: newField.nestedFields
            ? preserveIds(newField.nestedFields, existing?.nestedFields || [])
            : undefined,
        };
      });
    };

    return {
      ...improvedSchema,
      fields: preserveIds(improvedSchema.fields || [], currentSchema.fields),
    };
  } catch (error) {
    console.error("AI Schema Improvement Error:", error);
    throw new Error("Failed to improve schema with AI. Please try again.");
  }
}

export async function generateValidationRulesWithAI(
  currentSchema: DTOSchema
): Promise<DTOSchema> {
  const systemPrompt = `You are an expert in data validation and MongoDB schema design. Analyze the provided schema and add comprehensive validation rules for each field based on:

1. Field type and purpose
2. Common validation patterns
3. Security best practices
4. Data integrity requirements
5. Business logic constraints

Add validation rules like min/max values, string length limits, regex patterns, custom validators, etc.
Return the schema with enhanced validation rules in the same JSON format.`;

  try {
    const fullPrompt = `${systemPrompt}\n\nAdd comprehensive validation rules to this schema:\n${JSON.stringify(
      currentSchema,
      null,
      2
    )}`;
    
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No valid JSON found in AI response");
    }

    const validatedSchema = JSON.parse(jsonMatch[0]);

    const preserveStructure = (
      newFields: any[],
      existingFields: Field[]
    ): Field[] => {
      return newFields.map((newField) => {
        const existing = existingFields.find((f) => f.name === newField.name);
        return {
          ...existing,
          ...newField,
          id: existing?.id || Math.random().toString(36).substr(2, 9),
          isExpanded: existing?.isExpanded ?? true,
          nestedFields: newField.nestedFields
            ? preserveStructure(
                newField.nestedFields,
                existing?.nestedFields || []
              )
            : existing?.nestedFields,
        };
      });
    };

    return {
      ...currentSchema,
      ...validatedSchema,
      fields: preserveStructure(
        validatedSchema.fields || [],
        currentSchema.fields
      ),
    };
  } catch (error) {
    console.error("AI Validation Generation Error:", error);
    throw new Error(
      "Failed to generate validations with AI. Please try again."
    );
  }
}