"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { FIELD_TYPE_COLORS } from "@/lib/constants";
import {
    createNewField,
    removeFieldFromSchema,
    updateFieldInSchema,
} from "@/lib/functions/fiels-utils";
import type { DTOSchema, Field, FieldType } from "@/types/schema";
import {
    Braces,
    Calendar,
    ChevronDown,
    ChevronRight,
    Database,
    FileText,
    Hash,
    Layers,
    Link,
    List,
    Plus,
    Settings,
    ToggleLeft,
    Trash2,
    Type,
} from "lucide-react";

const FIELD_TYPE_ICONS = {
  string: Type,
  number: Hash,
  boolean: ToggleLeft,
  Date: Calendar,
  ObjectId: Link,
  array: List,
  object: Braces,
  enum: Settings,
  mixed: Layers,
  Buffer: Database,
  Map: Braces,
  Decimal128: Hash,
};

interface FieldRendererProps {
  field: Field;
  schema: DTOSchema;
  setSchema: (schema: DTOSchema | ((prev: DTOSchema) => DTOSchema)) => void;
  showAdvanced: boolean;
  depth?: number;
  parentFields?: Field[];
}

export function FieldRenderer({
  field,
  schema,
  setSchema,
  showAdvanced,
  depth = 0,
  parentFields,
}: FieldRendererProps) {
  const IconComponent = FIELD_TYPE_ICONS[field.type];
  const colorClass = FIELD_TYPE_COLORS[field.type];

  const updateField = (updates: Partial<Field>) => {
    setSchema((prev) => updateFieldInSchema(prev, field.id, updates));
  };

  const removeField = () => {
    setSchema((prev) => removeFieldFromSchema(prev, field.id, parentFields));
  };

  const toggleExpansion = () => {
    updateField({ isExpanded: !field.isExpanded });
  };

  const addNestedField = () => {
    const newField = createNewField();
    const currentNested = field.nestedFields || [];
    updateField({ nestedFields: [...currentNested, newField] });
  };

  return (
    <Card
      className={`mb-4 ${depth > 0 ? "ml-4 border-l-4 border-l-blue-200" : ""}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleExpansion}
              className="p-1"
            >
              {field.isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>

            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={`${colorClass} flex items-center gap-1`}
              >
                <IconComponent className="h-3 w-3" />
                {field.type}
              </Badge>

              <Input
                placeholder="Field name"
                value={field.name}
                onChange={(e) => updateField({ name: e.target.value })}
                className="w-40 h-8"
              />

              <Select
                value={field.type}
                onValueChange={(value: FieldType) =>
                  updateField({ type: value })
                }
              >
                <SelectTrigger className="w-32 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="string">String</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="boolean">Boolean</SelectItem>
                  <SelectItem value="Date">Date</SelectItem>
                  <SelectItem value="ObjectId">ObjectId</SelectItem>
                  <SelectItem value="Buffer">Buffer</SelectItem>
                  <SelectItem value="Map">Map</SelectItem>
                  <SelectItem value="Decimal128">Decimal128</SelectItem>
                  <SelectItem value="array">Array</SelectItem>
                  <SelectItem value="object">Object</SelectItem>
                  <SelectItem value="enum">Enum</SelectItem>
                  <SelectItem value="mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>

              {field.required && (
                <Badge variant="destructive" className="text-xs">
                  Required
                </Badge>
              )}
              {field.unique && (
                <Badge variant="secondary" className="text-xs">
                  Unique
                </Badge>
              )}
              {field.deprecated && (
                <Badge variant="outline" className="text-xs text-orange-600">
                  Deprecated
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {field.description && (
              <Badge variant="outline" className="text-xs">
                <FileText className="h-3 w-3 mr-1" />
                Documented
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={removeField}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <Collapsible open={field.isExpanded} onOpenChange={toggleExpansion}>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            {/* Basic Properties */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`required-${field.id}`}
                  checked={field.required}
                  onCheckedChange={(checked) =>
                    updateField({ required: !!checked })
                  }
                />
                <Label htmlFor={`required-${field.id}`}>Required</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`unique-${field.id}`}
                  checked={field.unique}
                  onCheckedChange={(checked) =>
                    updateField({ unique: !!checked })
                  }
                />
                <Label htmlFor={`unique-${field.id}`}>Unique</Label>
              </div>
            </div>

            {/* Advanced Properties */}
            {showAdvanced && (
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`index-${field.id}`}
                    checked={field.index}
                    onCheckedChange={(checked) =>
                      updateField({ index: !!checked })
                    }
                  />
                  <Label htmlFor={`index-${field.id}`}>Index</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`sparse-${field.id}`}
                    checked={field.sparse}
                    onCheckedChange={(checked) =>
                      updateField({ sparse: !!checked })
                    }
                  />
                  <Label htmlFor={`sparse-${field.id}`}>Sparse</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`immutable-${field.id}`}
                    checked={field.immutable}
                    onCheckedChange={(checked) =>
                      updateField({ immutable: !!checked })
                    }
                  />
                  <Label htmlFor={`immutable-${field.id}`}>Immutable</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`deprecated-${field.id}`}
                    checked={field.deprecated}
                    onCheckedChange={(checked) =>
                      updateField({ deprecated: !!checked })
                    }
                  />
                  <Label htmlFor={`deprecated-${field.id}`}>Deprecated</Label>
                </div>
              </div>
            )}

            {/* Field Configuration */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Default Value</Label>
                <Input
                  placeholder="Default value"
                  value={field.default || ""}
                  onChange={(e) => updateField({ default: e.target.value })}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Input
                  placeholder="Field description"
                  value={field.description || ""}
                  onChange={(e) => updateField({ description: e.target.value })}
                />
              </div>
            </div>

            {/* Type-specific configurations */}
            {field.type === "ObjectId" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Reference</Label>
                  <Input
                    placeholder="Model reference (e.g., User)"
                    value={field.ref || ""}
                    onChange={(e) => updateField({ ref: e.target.value })}
                  />
                </div>
                {showAdvanced && (
                  <div>
                    <Label>Reference Path</Label>
                    <Input
                      placeholder="Dynamic reference path"
                      value={field.refPath || ""}
                      onChange={(e) => updateField({ refPath: e.target.value })}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Array Configuration */}
            {field.type === "array" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Array Type</Label>
                    <Select
                      value={field.arrayType || "string"}
                      onValueChange={(value: FieldType) =>
                        updateField({ arrayType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="string">String</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="boolean">Boolean</SelectItem>
                        <SelectItem value="Date">Date</SelectItem>
                        <SelectItem value="ObjectId">ObjectId</SelectItem>
                        <SelectItem value="object">Object</SelectItem>
                        <SelectItem value="mixed">Mixed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {field.arrayType === "ObjectId" && (
                    <div>
                      <Label>Array Reference</Label>
                      <Input
                        placeholder="Model reference"
                        value={field.arrayRef || ""}
                        onChange={(e) =>
                          updateField({ arrayRef: e.target.value })
                        }
                      />
                    </div>
                  )}
                </div>

                {field.arrayType === "object" && (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <Label className="text-sm font-medium">
                        Array Object Fields
                      </Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addNestedField}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Field
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {field.nestedFields?.map((nestedField) => (
                        <FieldRenderer
                          key={nestedField.id}
                          field={nestedField}
                          schema={schema}
                          setSchema={setSchema}
                          showAdvanced={showAdvanced}
                          depth={depth + 1}
                          parentFields={field.nestedFields}
                        />
                      ))}
                      {(!field.nestedFields ||
                        field.nestedFields.length === 0) && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No nested fields. Click "Add Field" to add object
                          properties.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Object Configuration */}
            {field.type === "object" && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-sm font-medium">Object Fields</Label>
                  <Button variant="outline" size="sm" onClick={addNestedField}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Field
                  </Button>
                </div>
                <div className="space-y-4">
                  {field.nestedFields?.map((nestedField) => (
                    <FieldRenderer
                      key={nestedField.id}
                      field={nestedField}
                      schema={schema}
                      setSchema={setSchema}
                      showAdvanced={showAdvanced}
                      depth={depth + 1}
                      parentFields={field.nestedFields}
                    />
                  ))}
                  {(!field.nestedFields || field.nestedFields.length === 0) && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No nested fields. Click "Add Field" to add object
                      properties.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Enum Configuration */}
            {field.type === "enum" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Enum Values</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const currentEnum = field.enum || [];
                      updateField({
                        enum: [...currentEnum, { key: "", value: "" }],
                      });
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Value
                  </Button>
                </div>
                <div className="space-y-2">
                  {field.enum?.map((enumValue, index) => (
                    <div key={index} className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Key (e.g., ACTIVE)"
                        value={enumValue.key}
                        onChange={(e) => {
                          const newEnum = [...(field.enum || [])];
                          newEnum[index] = {
                            ...newEnum[index],
                            key: e.target.value,
                          };
                          updateField({ enum: newEnum });
                        }}
                      />
                      <Input
                        placeholder="Value (e.g., active)"
                        value={enumValue.value}
                        onChange={(e) => {
                          const newEnum = [...(field.enum || [])];
                          newEnum[index] = {
                            ...newEnum[index],
                            value: e.target.value,
                          };
                          updateField({ enum: newEnum });
                        }}
                      />
                    </div>
                  ))}
                  {(!field.enum || field.enum.length === 0) && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No enum values. Click "Add Value" to add enum options.
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
