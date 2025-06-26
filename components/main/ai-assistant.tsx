"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { DTOSchema } from "@/types/schema";
import {
    Code2,
    Database,
    FileText,
    Lightbulb,
    Loader2,
    Sparkles,
} from "lucide-react";
import { useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    generateSchemaWithAI,
    generateValidationRulesWithAI,
    improveSchemaWithAI,
} from "@/lib/functions/ai-service";

interface AIAssistantProps {
  onGenerate: (schema: DTOSchema) => void;
  currentSchema: DTOSchema;
}

export function AIAssistant({ onGenerate, currentSchema }: AIAssistantProps) {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateFromPrompt = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      const schema = await generateSchemaWithAI(prompt);
      onGenerate(schema);
      setSuggestions([]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate schema"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImproveSchema = async () => {
    if (currentSchema.fields.length === 0) {
      setError("Please create a schema first before asking for improvements");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const improvedSchema = await improveSchemaWithAI(currentSchema);
      onGenerate(improvedSchema);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to improve schema");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateValidations = async () => {
    if (currentSchema.fields.length === 0) {
      setError("Please create a schema first before generating validations");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const schemaWithValidations = await generateValidationRulesWithAI(
        currentSchema
      );
      onGenerate(schemaWithValidations);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate validations"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const promptSuggestions = [
    "Create a User schema with authentication fields, profile information, and preferences",
    "Generate an E-commerce Product schema with variants, pricing, and inventory tracking",
    "Build a Blog Post schema with content, metadata, comments, and SEO fields",
    "Create an Order schema for an online store with items, shipping, and payment details",
    "Generate a Company schema with employee management and organizational structure",
    "Build a Task Management schema with projects, assignments, and progress tracking",
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Generation Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              AI Schema Generation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Describe your schema requirements
              </label>
              <Textarea
                placeholder="e.g., Create a user management schema with authentication, profile data, roles, and preferences. Include validation for email, password strength, and required fields."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>

            <Button
              onClick={handleGenerateFromPrompt}
              disabled={isGenerating || !prompt.trim()}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating with AI...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Schema with AI
                </>
              )}
            </Button>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Quick Start Templates
              </label>
              <div className="grid grid-cols-1 gap-2">
                {promptSuggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => setPrompt(suggestion)}
                    className="text-left justify-start h-auto p-3 whitespace-normal"
                  >
                    <Lightbulb className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Enhancement Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code2 className="h-5 w-5 text-blue-500" />
              AI Schema Enhancement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Button
                onClick={handleImproveSchema}
                disabled={isGenerating || currentSchema.fields.length === 0}
                className="w-full"
                variant="outline"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Database className="h-4 w-4 mr-2" />
                )}
                Improve Current Schema
              </Button>

              <Button
                onClick={handleGenerateValidations}
                disabled={isGenerating || currentSchema.fields.length === 0}
                className="w-full"
                variant="outline"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4 mr-2" />
                )}
                Generate Smart Validations
              </Button>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">AI Enhancement Features:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Add missing fields and relationships</li>
                <li>• Optimize field types and constraints</li>
                <li>• Generate comprehensive validations</li>
                <li>• Suggest indexes for performance</li>
                <li>• Add documentation and examples</li>
                <li>• Implement best practices</li>
              </ul>
            </div>

            {currentSchema.fields.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Current Schema Stats
                </label>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    {currentSchema.fields.length} Fields
                  </Badge>
                  <Badge variant="secondary">
                    {currentSchema.fields.filter((f) => f.required).length}{" "}
                    Required
                  </Badge>
                  <Badge variant="secondary">
                    {
                      currentSchema.fields.filter((f) => f.type === "object")
                        .length
                    }{" "}
                    Objects
                  </Badge>
                  <Badge variant="secondary">
                    {
                      currentSchema.fields.filter((f) => f.type === "array")
                        .length
                    }{" "}
                    Arrays
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            AI Tips for Better Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">For Schema Generation:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Be specific about your use case</li>
                <li>• Mention required relationships</li>
                <li>• Include validation requirements</li>
                <li>• Specify data types when important</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Best Practices:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Review AI suggestions before using</li>
                <li>• Test generated validations</li>
                <li>• Customize field names as needed</li>
                <li>• Add business-specific constraints</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
