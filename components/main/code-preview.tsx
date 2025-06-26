"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, Database, Download, FileText } from "lucide-react";

interface CodePreviewProps {
  generatedDTO: string;
  generatedSchema: string;
  schemaName: string;
}

export function CodePreview({
  generatedDTO,
  generatedSchema,
  schemaName,
}: CodePreviewProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {schemaName.toLowerCase()}.dto.ts
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(generatedDTO)}
                disabled={!generatedDTO}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  downloadFile(
                    generatedDTO,
                    `${schemaName.toLowerCase()}.dto.ts`
                  )
                }
                disabled={!generatedDTO}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <pre className="bg-muted p-4 rounded-lg text-sm">
              <code>
                {generatedDTO ||
                  "Click 'Generate Code' to see the TypeScript DTO"}
              </code>
            </pre>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              {schemaName.toLowerCase()}.model.ts
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(generatedSchema)}
                disabled={!generatedSchema}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  downloadFile(
                    generatedSchema,
                    `${schemaName.toLowerCase()}.model.ts`
                  )
                }
                disabled={!generatedSchema}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <pre className="bg-muted p-4 rounded-lg text-sm">
              <code>
                {generatedSchema ||
                  "Click 'Generate Code' to see the Mongoose schema"}
              </code>
            </pre>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
