"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  generateDTO,
  generateMongooseSchema,
} from "@/lib/functions/generators";
import type { DTOSchema } from "@/types/schema";
import { Eye, Settings, Sparkles } from "lucide-react";
import { useState } from "react";
import { AIAssistant } from "./ai-assistant";
import { CodePreview } from "./code-preview";
import { SchemaBuilder } from "./schema-builder";

export function DTOGenerator() {
  const [schema, setSchema] = useState<DTOSchema>({
    name: "User",
    fields: [],
    imports: [],
    enums: [],
    indexes: [],
    options: {
      timestamps: true,
      versionKey: false,
      strict: true,
      validateBeforeSave: true,
      autoIndex: true,
    },
    hooks: { pre: [], post: [] },
    virtuals: [],
    methods: [],
    statics: [],
  });

  const [generatedDTO, setGeneratedDTO] = useState("");
  const [generatedSchema, setGeneratedSchema] = useState("");
  const [activeTab, setActiveTab] = useState("builder");

  const handleGenerate = () => {
    setGeneratedDTO(generateDTO(schema));
    setGeneratedSchema(generateMongooseSchema(schema));
    setActiveTab("preview");
  };

  const handleAIGenerate = (aiGeneratedSchema: DTOSchema) => {
    setSchema(aiGeneratedSchema);
    setGeneratedDTO(generateDTO(aiGeneratedSchema));
    setGeneratedSchema(generateMongooseSchema(aiGeneratedSchema));
    setActiveTab("preview");
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-primary bg-clip-text">
          DTO Buddy
        </h1>
        <p className="text-lg text-muted-foreground">
          Create complex TypeScript DTOs and Mongoose schemas with AI
          assistance, advanced features, and comprehensive validation.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="builder" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Schema Builder
          </TabsTrigger>
          <TabsTrigger value="ai-assistant" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            AI Assistant
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Code Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="builder">
          <SchemaBuilder
            schema={schema}
            setSchema={setSchema}
            onGenerate={handleGenerate}
          />
        </TabsContent>

        <TabsContent value="ai-assistant">
          <AIAssistant onGenerate={handleAIGenerate} currentSchema={schema} />
        </TabsContent>

        <TabsContent value="preview">
          <CodePreview
            generatedDTO={generatedDTO}
            generatedSchema={generatedSchema}
            schemaName={schema.name}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
