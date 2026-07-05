import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { messages } from "@/messages/zh-TW";
import { generatorControls, previewLabels } from "../constants";
import type {
  GeneratedScript,
  ScriptGenerationForm,
  ScriptPreviewKey
} from "../types";

type ScriptGeneratorProps = {
  formValues: ScriptGenerationForm;
  script: GeneratedScript;
  isGenerating: boolean;
  error: string | null;
  onFormChange: (key: keyof ScriptGenerationForm, value: string) => void;
  onGenerate: () => void;
  onScriptChange: (key: ScriptPreviewKey, value: string) => void;
};

export function ScriptGenerator({
  formValues,
  script,
  isGenerating,
  error,
  onFormChange,
  onGenerate,
  onScriptChange
}: ScriptGeneratorProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle>{messages.contentStudio.aiScriptGenerator}</CardTitle>
            <CardDescription>
              用目前分類與欄位產生短影音腳本預覽。
            </CardDescription>
          </div>
          <Badge variant="outline" className="w-fit">
            OpenAI
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          {generatorControls.map((control) => (
            <label
              key={control.key}
              className="rounded-lg border bg-background p-4"
            >
              <span className="text-xs font-medium text-muted-foreground">
                {control.label}
              </span>
              <select
                className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={formValues[control.key]}
                onChange={(event) => onFormChange(control.key, event.target.value)}
              >
                {control.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>

        <div className="space-y-3">
          <Button onClick={onGenerate} disabled={isGenerating}>
            {isGenerating ? "產生中..." : messages.contentStudio.generateScript}
          </Button>
          {error ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {previewLabels.map((preview) => (
            <Card key={preview.key} className="shadow-none">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <CardTitle>{preview.title}</CardTitle>
                  <Badge variant="outline">可編輯預覽</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <label className="sr-only" htmlFor={`script-preview-${preview.key}`}>
                  {preview.title}
                </label>
                {preview.key === "script" ? (
                  <textarea
                    id={`script-preview-${preview.key}`}
                    className="min-h-32 w-full resize-y rounded-md border bg-secondary/40 p-4 text-sm leading-6 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={script[preview.key]}
                    onChange={(event) =>
                      onScriptChange(preview.key, event.target.value)
                    }
                  />
                ) : (
                  <input
                    id={`script-preview-${preview.key}`}
                    className="h-12 w-full rounded-md border bg-secondary/40 px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={script[preview.key]}
                    onChange={(event) =>
                      onScriptChange(preview.key, event.target.value)
                    }
                  />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
