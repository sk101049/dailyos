"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import type { GeneratedScript, StoryboardRow } from "../types";

type AIImageStudioProps = {
  script: GeneratedScript;
  storyboardRows: StoryboardRow[];
};

type ReferenceMode = "character" | "style" | "both";

type LibraryItem = {
  id: string;
  title: string;
  description: string;
  prompt: string;
};

function fileNames(files: FileList | null) {
  return Array.from(files ?? []).map((file) => file.name);
}

function compactList(items: string[]) {
  return items.length > 0 ? items.join(", ") : "No references uploaded";
}

export function AIImageStudio({ script, storyboardRows }: AIImageStudioProps) {
  const [characterReferences, setCharacterReferences] = useState<string[]>([]);
  const [styleReferences, setStyleReferences] = useState<string[]>([]);
  const [storyboardReferences, setStoryboardReferences] = useState<string[]>([]);
  const [referenceMode, setReferenceMode] = useState<ReferenceMode>("both");
  const [message, setMessage] = useState<string | null>(null);
  const [characterLibrary, setCharacterLibrary] = useState<LibraryItem[]>([]);
  const [storyboardLibrary, setStoryboardLibrary] = useState<LibraryItem[]>([]);

  const promptPackage = useMemo(() => {
    const scenes = storyboardRows
      .map((row) => `${row.shot}. ${row.visual || row.subtitle || row.narration}`)
      .join("\n");

    return [
      `Project: ${script.title}`,
      "Goal: Generate reusable character template and storyboard images.",
      "Character: friendly female insurance knowledge host, age 30-40, natural, trustworthy, warm, social-media ready.",
      "Style: bright 9:16 vertical insurance education short, large fixed text, clean layout, consistent outfit and colors.",
      `Reference mode: ${referenceMode}`,
      `Character references: ${compactList(characterReferences)}`,
      `Style references: ${compactList(styleReferences)}`,
      `Storyboard layout references: ${compactList(storyboardReferences)}`,
      "Script:",
      script.script,
      "Storyboard scenes:",
      scenes || "Use the current script to create 7 clear storyboard frames."
    ].join("\n");
  }, [
    characterReferences,
    referenceMode,
    script.script,
    script.title,
    storyboardReferences,
    storyboardRows,
    styleReferences
  ]);

  function generateCharacterTemplate() {
    const item: LibraryItem = {
      id: crypto.randomUUID(),
      title: `${script.title} character template`,
      description: "Presenter sheet placeholder with identity, outfit, palette, expressions, and gestures.",
      prompt: promptPackage
    };

    setCharacterLibrary((items) => [item, ...items]);
    setMessage("Character template prompt saved to project library.");
  }

  function generateStoryboardImages() {
    const item: LibraryItem = {
      id: crypto.randomUUID(),
      title: `${script.title} storyboard package`,
      description: "Storyboard image package placeholder with scene frames, full sheet, and generation prompts.",
      prompt: promptPackage
    };

    setStoryboardLibrary((items) => [item, ...items]);
    setMessage("Storyboard image prompt package saved to project library.");
  }

  async function copyPromptPackage() {
    if (!navigator.clipboard?.writeText) {
      setMessage("Clipboard is unavailable. Prompt package is visible below.");
      return;
    }

    await navigator.clipboard.writeText(promptPackage);
    setMessage("Prompt package copied.");
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1">
            <CardTitle>AI Image Studio</CardTitle>
            <CardDescription>
              Generate provider-agnostic character templates and storyboard image prompts from the current script.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={generateCharacterTemplate}>
              Generate Character Template
            </Button>
            <Button onClick={generateStoryboardImages}>
              Generate Storyboard Images
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <section className="grid gap-3 lg:grid-cols-4">
          <label className="space-y-2 rounded-lg border bg-background p-3">
            <span className="text-sm font-medium">Upload References</span>
            <input
              type="file"
              multiple
              accept="image/*"
              className="w-full text-sm text-muted-foreground"
              onChange={(event) => setCharacterReferences(fileNames(event.target.files))}
            />
            <span className="block text-xs text-muted-foreground">
              Character: {compactList(characterReferences)}
            </span>
          </label>
          <label className="space-y-2 rounded-lg border bg-background p-3">
            <span className="text-sm font-medium">Style Reference Boards</span>
            <input
              type="file"
              multiple
              accept="image/*"
              className="w-full text-sm text-muted-foreground"
              onChange={(event) => setStyleReferences(fileNames(event.target.files))}
            />
            <span className="block text-xs text-muted-foreground">
              Style: {compactList(styleReferences)}
            </span>
          </label>
          <label className="space-y-2 rounded-lg border bg-background p-3">
            <span className="text-sm font-medium">Storyboard Layouts</span>
            <input
              type="file"
              multiple
              accept="image/*"
              className="w-full text-sm text-muted-foreground"
              onChange={(event) => setStoryboardReferences(fileNames(event.target.files))}
            />
            <span className="block text-xs text-muted-foreground">
              Layout: {compactList(storyboardReferences)}
            </span>
          </label>
          <label className="space-y-2 rounded-lg border bg-background p-3">
            <span className="text-sm font-medium">Apply References To</span>
            <select
              className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={referenceMode}
              onChange={(event) => setReferenceMode(event.target.value as ReferenceMode)}
            >
              <option value="both">Character and style</option>
              <option value="character">Character only</option>
              <option value="style">Style only</option>
            </select>
          </label>
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-lg border bg-secondary/40 p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold">Character Library</h3>
              <Badge variant="outline">Template Sheet</Badge>
            </div>
            <div className="mt-3 space-y-2">
              {characterLibrary.length === 0 ? (
                <p className="text-sm text-muted-foreground">No character templates yet.</p>
              ) : (
                characterLibrary.map((item) => (
                  <article key={item.id} className="rounded-md border bg-background p-3">
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
                  </article>
                ))
              )}
            </div>
          </div>
          <div className="rounded-lg border bg-secondary/40 p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold">Storyboard Library</h3>
              <Badge variant="outline">Scene Images</Badge>
            </div>
            <div className="mt-3 space-y-2">
              {storyboardLibrary.length === 0 ? (
                <p className="text-sm text-muted-foreground">No storyboard image packages yet.</p>
              ) : (
                storyboardLibrary.map((item) => (
                  <article key={item.id} className="rounded-md border bg-background p-3">
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
                  </article>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="rounded-lg border bg-background p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold">Prompt Package</h3>
              <p className="text-xs text-muted-foreground">
                Includes character sheet, individual scene images, full storyboard sheet, and generation notes.
              </p>
            </div>
            <Button variant="outline" onClick={copyPromptPackage}>
              Copy Prompt Package
            </Button>
          </div>
          <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap break-words rounded-md bg-secondary/40 p-3 text-sm leading-6 text-muted-foreground">
            {promptPackage}
          </pre>
        </section>

        {message ? (
          <p className="rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground">
            {message}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
