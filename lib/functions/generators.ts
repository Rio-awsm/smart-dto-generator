import { DTOSchema, Field } from "@/types/schema";


export function generateTypeScriptType(field: Field): string {
  switch (field.type) {
    case "string":
      return "string";
    case "number":
      return "number";
    case "boolean":
      return "boolean";
    case "Date":
      return "Date";
    case "ObjectId":
      return "Types.ObjectId";
    case "Buffer":
      return "Buffer";
    case "mixed":
      return "any";
    case "Map":
      return "Map<string, any>";
    case "Decimal128":
      return "Types.Decimal128";
    case "array":
      if (field.arrayType === "object" && field.nestedFields) {
        return `{\n${field.nestedFields
          .map(
            (f) =>
              `    ${f.name}${f.required ? "" : "?"}: ${generateTypeScriptType(
                f
              )};`
          )
          .join("\n")}\n  }[]`;
      }
      const arrayType =
        field.arrayType === "ObjectId"
          ? "Types.ObjectId"
          : field.arrayType === "Decimal128"
          ? "Types.Decimal128"
          : field.arrayType || "any";
      return `${arrayType}[]`;
    case "object":
      if (field.nestedFields) {
        return `{\n${field.nestedFields
          .map(
            (f) =>
              `    ${f.name}${f.required ? "" : "?"}: ${generateTypeScriptType(
                f
              )};`
          )
          .join("\n")}\n  }`;
      }
      return "object";
    case "enum":
      return field.name.charAt(0).toUpperCase() + field.name.slice(1) + "Enum";
    default:
      return "any";
  }
}

export function generateMongooseType(field: Field): string {
  switch (field.type) {
    case "string":
      return "String";
    case "number":
      return "Number";
    case "boolean":
      return "Boolean";
    case "Date":
      return "Date";
    case "ObjectId":
      return "Schema.Types.ObjectId";
    case "Buffer":
      return "Buffer";
    case "mixed":
      return "Schema.Types.Mixed";
    case "Map":
      return "Map";
    case "Decimal128":
      return "Schema.Types.Decimal128";
    case "array":
      if (field.arrayType === "object" && field.nestedFields) {
        return `[{\n${field.nestedFields
          .map((f) => `    ${f.name}: ${generateMongooseFieldDefinition(f)}`)
          .join(",\n")},\n    _id: false\n  }]`;
      }
      const mongooseArrayType =
        field.arrayType === "ObjectId"
          ? "Schema.Types.ObjectId"
          : field.arrayType === "string"
          ? "String"
          : field.arrayType === "number"
          ? "Number"
          : field.arrayType === "boolean"
          ? "Boolean"
          : field.arrayType === "Date"
          ? "Date"
          : field.arrayType === "Decimal128"
          ? "Schema.Types.Decimal128"
          : "Schema.Types.Mixed";
      return `[${mongooseArrayType}]`;
    case "object":
      if (field.nestedFields) {
        return `{\n${field.nestedFields
          .map((f) => `    ${f.name}: ${generateMongooseFieldDefinition(f)}`)
          .join(",\n")}\n  }`;
      }
      return "Schema.Types.Mixed";
    case "enum":
      return "String";
    default:
      return "Schema.Types.Mixed";
  }
}

export function generateMongooseFieldDefinition(field: Field): string {
  const baseType = generateMongooseType(field);
  const options: string[] = [];

  if (field.type === "array" || field.type === "object") {
    return baseType;
  }

  options.push(`type: ${baseType}`);

  if (field.required) options.push("required: true");
  if (field.unique) options.push("unique: true");
  if (field.index) options.push("index: true");
  if (field.sparse) options.push("sparse: true");
  if (field.immutable) options.push("immutable: true");
  if (field.default) {
    const defaultValue =
      field.type === "string"
        ? `"${field.default}"`
        : field.default === "Date.now"
        ? "Date.now"
        : field.default;
    options.push(`default: ${defaultValue}`);
  }
  if (field.ref) options.push(`ref: "${field.ref}"`);
  if (field.refPath) options.push(`refPath: "${field.refPath}"`);
  if (field.alias) options.push(`alias: "${field.alias}"`);
  if (field.select === false) options.push("select: false");

  if (field.validation) {
    field.validation.forEach((rule) => {
      switch (rule.type) {
        case "min":
          options.push(`min: ${rule.value}`);
          break;
        case "max":
          options.push(`max: ${rule.value}`);
          break;
        case "minLength":
          options.push(`minLength: ${rule.value}`);
          break;
        case "maxLength":
          options.push(`maxLength: ${rule.value}`);
          break;
        case "match":
          options.push(`match: ${rule.value}`);
          break;
      }
    });
  }

  if (field.type === "enum" && field.enum) {
    const enumName =
      field.name.charAt(0).toUpperCase() + field.name.slice(1) + "Enum";
    options.push(`enum: Object.values(${enumName})`);
  }

  return options.length > 1
    ? `{\n      ${options.join(",\n      ")}\n    }`
    : baseType;
}

export function generateDTO(schema: DTOSchema): string {
  const imports = ['import { Document, Types } from "mongoose";'];

  schema.imports.forEach((imp) => {
    if (imp.trim()) imports.push(imp);
  });

  // Generate enums
  const enumDefinitions = schema.fields
    .filter((f) => f.type === "enum" && f.enum)
    .map((field) => {
      const enumName =
        field.name.charAt(0).toUpperCase() + field.name.slice(1) + "Enum";
      const values = field
        .enum!.map((e) => `  ${e.key} = "${e.value}"`)
        .join(",\n");
      return `enum ${enumName} {\n${values}\n}`;
    });

  // Generate interfaces for nested objects
  const generateNestedInterfaces = (fields: Field[], prefix = ""): string[] => {
    const interfaces: string[] = [];

    fields.forEach((field) => {
      if (field.type === "object" && field.nestedFields) {
        const interfaceName = `${prefix}${
          field.name.charAt(0).toUpperCase() + field.name.slice(1)
        }Type`;
        const interfaceFields = field.nestedFields
          .map(
            (f) =>
              `  ${f.name}${f.required ? "" : "?"}: ${generateTypeScriptType(
                f
              )};${f.description ? ` // ${f.description}` : ""}`
          )
          .join("\n");

        interfaces.push(`interface ${interfaceName} {\n${interfaceFields}\n}`);

        // Recursively generate interfaces for nested objects
        interfaces.push(
          ...generateNestedInterfaces(field.nestedFields, interfaceName)
        );
      }

      if (
        field.type === "array" &&
        field.arrayType === "object" &&
        field.nestedFields
      ) {
        const interfaceName = `${prefix}${
          field.name.charAt(0).toUpperCase() + field.name.slice(1)
        }ItemType`;
        const interfaceFields = field.nestedFields
          .map(
            (f) =>
              `  ${f.name}${f.required ? "" : "?"}: ${generateTypeScriptType(
                f
              )};${f.description ? ` // ${f.description}` : ""}`
          )
          .join("\n");

        interfaces.push(`interface ${interfaceName} {\n${interfaceFields}\n}`);

        // Recursively generate interfaces for nested objects
        interfaces.push(
          ...generateNestedInterfaces(field.nestedFields, interfaceName)
        );
      }
    });

    return interfaces;
  };

  const nestedInterfaces = generateNestedInterfaces(schema.fields, schema.name);

  const typeDefinition = `type ${schema.name}Dto = {\n${schema.fields
    .map(
      (field) =>
        `  ${field.name}${field.required ? "" : "?"}: ${generateTypeScriptType(
          field
        )};${field.description ? ` // ${field.description}` : ""}${
          field.deprecated ? " @deprecated" : ""
        }`
    )
    .join("\n")}\n};`;

  const derivedTypes = [
    `type ${schema.name}SchemaDto = ${schema.name}Dto & Document;`,
    `type Create${schema.name}Dto = Omit<${schema.name}Dto, '_id' | 'createdAt' | 'updatedAt'>;`,
    `type Update${schema.name}Dto = Partial<Create${schema.name}Dto>;`,
    `type ${schema.name}PopulatedDto = ${schema.name}Dto; // Add populated field types as needed`,
  ];

  // Generate exports
  const exports = [
    `${schema.name}Dto`,
    `${schema.name}SchemaDto`,
    `Create${schema.name}Dto`,
    `Update${schema.name}Dto`,
    `${schema.name}PopulatedDto`,
    ...schema.fields
      .filter((f) => f.type === "enum")
      .map((f) => f.name.charAt(0).toUpperCase() + f.name.slice(1) + "Enum"),
  ];

  const exportStatement = `export {\n  ${exports.join(",\n  ")}\n};`;

  return [
    imports.join("\n"),
    "",
    enumDefinitions.join("\n\n"),
    enumDefinitions.length > 0 ? "" : "",
    nestedInterfaces.join("\n\n"),
    nestedInterfaces.length > 0 ? "" : "",
    typeDefinition,
    "",
    derivedTypes.join("\n"),
    "",
    exportStatement,
  ]
    .filter((line) => line !== null)
    .join("\n");
}

export function generateMongooseSchema(schema: DTOSchema): string {
  const imports = [
    `import { Model, Schema, model } from "mongoose";`,
    `import { ${schema.name}SchemaDto${
      schema.fields.some((f) => f.type === "enum")
        ? ", " +
          schema.fields
            .filter((f) => f.type === "enum")
            .map(
              (f) => f.name.charAt(0).toUpperCase() + f.name.slice(1) + "Enum"
            )
            .join(", ")
        : ""
    } } from "../dtos/${schema.name.toLowerCase()}.dto";`,
  ];

  const schemaDefinition = `const ${schema.name}Schema = new Schema<${
    schema.name
  }SchemaDto>(
  {
${schema.fields
  .map(
    (field) => `    ${field.name}: ${generateMongooseFieldDefinition(field)}`
  )
  .join(",\n")}
  },
  {
    timestamps: ${schema.options.timestamps},
    versionKey: ${schema.options.versionKey},
    strict: ${schema.options.strict},
    validateBeforeSave: ${schema.options.validateBeforeSave},
    autoIndex: ${schema.options.autoIndex},${
    schema.options.collection
      ? `\n    collection: "${schema.options.collection}",`
      : ""
  }${
    schema.options.discriminatorKey
      ? `\n    discriminatorKey: "${schema.options.discriminatorKey}",`
      : ""
  }
  }
);`;

  const indexDefinitions =
    schema.indexes
      ?.map((index) => {
        const fields =
          index.fields.length === 1
            ? `{ ${index.fields[0]}: 1 }`
            : `{ ${index.fields.map((f) => `${f}: 1`).join(", ")} }`;

        const options = [];
        if (index.unique) options.push("unique: true");
        if (index.sparse) options.push("sparse: true");
        if (index.background) options.push("background: true");

        const optionsStr =
          options.length > 0 ? `, { ${options.join(", ")} }` : "";

        return `${schema.name}Schema.index(${fields}${optionsStr});`;
      })
      .join("\n") || "";

  const virtualDefinitions = schema.virtuals
    .map(
      (virtual) =>
        `${schema.name}Schema.virtual('${virtual}').get(function() {\n  // Add virtual logic here\n});`
    )
    .join("\n\n");

  const methodDefinitions = schema.methods
    .map(
      (method) =>
        `${schema.name}Schema.methods.${method} = function() {\n  // Add method logic here\n};`
    )
    .join("\n\n");

  const staticDefinitions = schema.statics
    .map(
      (staticMethod) =>
        `${schema.name}Schema.statics.${staticMethod} = function() {\n  // Add static method logic here\n};`
    )
    .join("\n\n");

  const hookDefinitions = [
    ...schema.hooks.pre.map(
      (hook) =>
        `${schema.name}Schema.pre('${hook}', function(next) {\n  // Add pre-hook logic here\n  next();\n});`
    ),
    ...schema.hooks.post.map(
      (hook) =>
        `${schema.name}Schema.post('${hook}', function(doc) {\n  // Add post-hook logic here\n});`
    ),
  ].join("\n\n");

  const modelDefinition = `const ${schema.name}: Model<${schema.name}SchemaDto> = model("${schema.name}", ${schema.name}Schema);`;

  const exportStatement = `export { ${schema.name} };`;

  return [
    imports.join("\n"),
    "",
    schemaDefinition,
    "",
    indexDefinitions,
    indexDefinitions ? "" : "",
    virtualDefinitions,
    virtualDefinitions ? "" : "",
    methodDefinitions,
    methodDefinitions ? "" : "",
    staticDefinitions,
    staticDefinitions ? "" : "",
    hookDefinitions,
    hookDefinitions ? "" : "",
    modelDefinition,
    "",
    exportStatement,
  ]
    .filter((line) => line !== null)
    .join("\n");
}
