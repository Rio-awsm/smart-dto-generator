"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { createNewField } from "@/lib/functions/fiels-utils";
import type { DTOSchema } from "@/types/schema";
import { Code, Database, Layers, Plus, RefreshCw } from "lucide-react";
import { useCallback, useState } from "react";
import { FieldRenderer } from "./field-renderer";

interface SchemaBuilderProps {
  schema: DTOSchema;
  setSchema: (schema: DTOSchema | ((prev: DTOSchema) => DTOSchema)) => void;
  onGenerate: () => void;
}

export function SchemaBuilder({
  schema,
  setSchema,
  onGenerate,
}: SchemaBuilderProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const addField = useCallback(() => {
    const newField = createNewField();
    setSchema((prev) => ({
      ...prev,
      fields: [...prev.fields, newField],
    }));
  }, [setSchema]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Configuration Panel */}
      <div className="lg:col-span-1 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Schema Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Schema Name</Label>
              <Input
                placeholder="e.g., User, Order, Product"
                value={schema.name}
                onChange={(e) =>
                  setSchema((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>

            <div>
              <Label>Custom Imports</Label>
              <Textarea
                placeholder="e.g., import { AddressType } from './user.dto';"
                value={schema.imports.join("\n")}
                onChange={(e) =>
                  setSchema((prev) => ({
                    ...prev,
                    imports: e.target.value
                      .split("\n")
                      .filter((line) => line.trim()),
                  }))
                }
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Advanced Options</Label>
              <Switch
                checked={showAdvanced}
                onCheckedChange={setShowAdvanced}
              />
            </div>

            {showAdvanced && (
              <div className="space-y-4 p-4 border rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="timestamps"
                      checked={schema.options.timestamps}
                      onCheckedChange={(checked) =>
                        setSchema((prev) => ({
                          ...prev,
                          options: { ...prev.options, timestamps: !!checked },
                        }))
                      }
                    />
                    <Label htmlFor="timestamps">Timestamps</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="versionKey"
                      checked={schema.options.versionKey}
                      onCheckedChange={(checked) =>
                        setSchema((prev) => ({
                          ...prev,
                          options: { ...prev.options, versionKey: !!checked },
                        }))
                      }
                    />
                    <Label htmlFor="versionKey">Version Key</Label>
                  </div>
                </div>

                <div>
                  <Label>Collection Name</Label>
                  <Input
                    placeholder="Custom collection name"
                    value={schema.options.collection || ""}
                    onChange={(e) =>
                      setSchema((prev) => ({
                        ...prev,
                        options: {
                          ...prev.options,
                          collection: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={addField} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Field
            </Button>
            <Button onClick={onGenerate} className="w-full" variant="default">
              <RefreshCw className="h-4 w-4 mr-2" />
              Generate Code
            </Button>
            <Separator />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-2">Field Statistics:</p>
              <div className="space-y-1">
                <p>Total Fields: {schema.fields.length}</p>
                <p>
                  Required Fields:{" "}
                  {schema.fields.filter((f) => f.required).length}
                </p>
                <p>
                  Unique Fields: {schema.fields.filter((f) => f.unique).length}
                </p>
                <p>
                  Enum Fields:{" "}
                  {schema.fields.filter((f) => f.type === "enum").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fields Panel */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Schema Fields ({schema.fields.length})
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setSchema((prev) => ({
                      ...prev,
                      fields: prev.fields.map((f) => ({
                        ...f,
                        isExpanded: true,
                      })),
                    }))
                  }
                >
                  Expand All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setSchema((prev) => ({
                      ...prev,
                      fields: prev.fields.map((f) => ({
                        ...f,
                        isExpanded: false,
                      })),
                    }))
                  }
                >
                  Collapse All
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-4">
                {schema.fields.map((field) => (
                  <FieldRenderer
                    key={field.id}
                    field={field}
                    schema={schema}
                    setSchema={setSchema}
                    showAdvanced={showAdvanced}
                  />
                ))}
                {schema.fields.length === 0 && (
                  <div className="text-center py-12">
                    <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg font-medium text-muted-foreground mb-2">
                      No fields added yet
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Start building your schema by adding fields
                    </p>
                    <Button onClick={addField}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Field
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
