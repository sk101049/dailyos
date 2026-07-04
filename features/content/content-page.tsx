"use client";

import { useEffect, useState } from "react";
import { AIImageStudio } from "./components/ai-image-studio";
import { ContentAssistant } from "./components/content-assistant";
import { DigitalHumanStudio } from "./components/digital-human-studio";
import { GptMode } from "./components/gpt-mode";
import { GptOutputImport } from "./components/gpt-output-import";
import { PageHero } from "./components/page-hero";
import { PromptBuilder } from "./components/prompt-builder";
import { ScriptGenerator } from "./components/script-generator";
import { ScriptLibrary } from "./components/script-library";
import { ScriptWorkspace } from "./components/script-workspace";
import { StoryboardBuilder } from "./components/storyboard-builder";
import { ThumbnailPromptBuilder } from "./components/thumbnail-prompt-builder";
import { TopicSelector } from "./components/topic-selector";
import { initialFormValues, initialGeneratedScript } from "./constants";
import { useScriptLibrary } from "./hooks/use-script-library";
import type {
  GeneratedScript,
  SavedScript,
  ScriptApiResponse,
  ScriptGenerationForm,
  ScriptPreviewKey,
  ScriptStatus,
  StoryboardRow,
  ThumbnailRatio,
  ThumbnailStyle
} from "./types";
import {
  buildGptPrompt,
  buildInitialStoryboard,
  buildThumbnailPrompt,
  formatStoryboard,
  parseGptOutput
} from "./utils";

export function ContentPage() {
  const [formValues, setFormValues] =
    useState<ScriptGenerationForm>(initialFormValues);
  const [generatedScript, setGeneratedScript] =
    useState<GeneratedScript>(initialGeneratedScript);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [gptOutput, setGptOutput] = useState("");
  const [gptImportMessage, setGptImportMessage] = useState<string | null>(null);
  const [scriptStatus, setScriptStatus] = useState<ScriptStatus>("草稿");
  const [thumbnailStyle, setThumbnailStyle] = useState<ThumbnailStyle>("寫實");
  const [thumbnailRatio, setThumbnailRatio] = useState<ThumbnailRatio>("9:16");
  const [thumbnailIncludePerson, setThumbnailIncludePerson] = useState(true);
  const [thumbnailCopyMessage, setThumbnailCopyMessage] = useState<string | null>(null);
  const [storyboardRows, setStoryboardRows] = useState<StoryboardRow[]>(() =>
    buildInitialStoryboard(initialGeneratedScript)
  );
  const [hasLoadedStoryboard, setHasLoadedStoryboard] = useState(false);
  const [storyboardCopyMessage, setStoryboardCopyMessage] = useState<string | null>(null);
  const { savedScripts, setSavedScripts, libraryMessage, setLibraryMessage } =
    useScriptLibrary();

  const gptPrompt = buildGptPrompt(formValues);
  const thumbnailPrompt = buildThumbnailPrompt({
    script: generatedScript,
    formValues,
    style: thumbnailStyle,
    ratio: thumbnailRatio,
    includePerson: thumbnailIncludePerson
  });

  useEffect(() => {
    const saved = window.localStorage.getItem("dailyos-storyboard-v2");
    if (!saved) {
      setHasLoadedStoryboard(true);
      return;
    }

    try {
      const parsed = JSON.parse(saved) as StoryboardRow[];
      if (Array.isArray(parsed)) {
        setStoryboardRows(parsed);
      }
    } catch {
      window.localStorage.removeItem("dailyos-storyboard-v2");
    } finally {
      setHasLoadedStoryboard(true);
    }
  }, []);

  useEffect(() => {
    if (hasLoadedStoryboard) {
      window.localStorage.setItem("dailyos-storyboard-v2", JSON.stringify(storyboardRows));
    }
  }, [hasLoadedStoryboard, storyboardRows]);

  async function handleGenerateScript() {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/script", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formValues)
      });
      const payload = (await response.json()) as ScriptApiResponse;

      if (!response.ok || !payload.script) {
        throw new Error(payload.error ?? "無法產生腳本，請稍後再試。");
      }

      setGeneratedScript(payload.script);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "無法產生腳本，請稍後再試。"
      );
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleCopyGptPrompt() {
    if (!navigator.clipboard?.writeText) {
      setCopyMessage("目前瀏覽器不支援自動複製，請手動選取並複製 GPT Prompt。");
      return;
    }

    try {
      await navigator.clipboard.writeText(gptPrompt);
      setCopyMessage("已複製 GPT Prompt。");
    } catch {
      setCopyMessage("無法自動複製，請手動選取並複製 GPT Prompt。");
    }
  }

  async function handleOpenChatGpt() {
    if (!navigator.clipboard?.writeText) {
      setCopyMessage("目前瀏覽器不支援自動複製，請手動選取 GPT Prompt 後貼到 ChatGPT。");
      return;
    }

    const chatGptWindow = window.open("https://chatgpt.com", "_blank");
    if (chatGptWindow) {
      chatGptWindow.opener = null;
    }

    try {
      await navigator.clipboard.writeText(gptPrompt);
      setCopyMessage(
        chatGptWindow
          ? "已複製 GPT Prompt，請在新開啟的 ChatGPT 分頁貼上使用。"
          : "已複製 GPT Prompt，但瀏覽器封鎖了新分頁，請手動開啟 ChatGPT 後貼上。"
      );
    } catch {
      setCopyMessage("無法自動複製，請手動選取 GPT Prompt 後貼到 ChatGPT。");
    }
  }

  async function handleCopyThumbnailPrompt() {
    if (!navigator.clipboard?.writeText) {
      setThumbnailCopyMessage("目前瀏覽器不支援自動複製，請手動選取並複製縮圖 Prompt。");
      return;
    }

    try {
      await navigator.clipboard.writeText(thumbnailPrompt);
      setThumbnailCopyMessage("已複製縮圖 Prompt。");
    } catch {
      setThumbnailCopyMessage("無法自動複製，請手動選取並複製縮圖 Prompt。");
    }
  }

  function handleBuildStoryboard() {
    setStoryboardRows(buildInitialStoryboard(generatedScript));
    setStoryboardCopyMessage("已從目前腳本更新分鏡。");
  }

  function handleUpdateStoryboardRow(
    id: string,
    field: keyof Omit<StoryboardRow, "id">,
    value: string
  ) {
    setStoryboardRows((rows) =>
      rows.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
    setStoryboardCopyMessage(null);
  }

  function handleAddStoryboardRow() {
    setStoryboardRows((rows) => [
      ...rows,
      {
        id: crypto.randomUUID(),
        shot: String(rows.length + 1),
        visual: "",
        narration: "",
        subtitle: "",
        broll: "",
        cameraShot: "Medium shot",
        backgroundLocation: "",
        actionGesture: "",
        facialExpression: ""
      }
    ]);
    setStoryboardCopyMessage(null);
  }

  function handleApplyCharacterLock(characterProfileId: string) {
    setStoryboardRows((rows) =>
      rows.map((row) => ({ ...row, characterProfileId }))
    );
    setStoryboardCopyMessage("Character lock applied to all scenes.");
  }

  function handleApplyVoiceLock(voiceProfileId: string) {
    setStoryboardRows((rows) => rows.map((row) => ({ ...row, voiceProfileId })));
    setStoryboardCopyMessage("Voice lock applied to all scenes.");
  }

  function handleDeleteStoryboardRow(id: string) {
    setStoryboardRows((rows) => rows.filter((row) => row.id !== id));
    setStoryboardCopyMessage(null);
  }

  async function handleCopyStoryboard() {
    const text = formatStoryboard(storyboardRows);

    if (!navigator.clipboard?.writeText) {
      setStoryboardCopyMessage("目前瀏覽器不支援自動複製，請手動選取並複製分鏡。");
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setStoryboardCopyMessage("已複製分鏡。");
    } catch {
      setStoryboardCopyMessage("無法自動複製，請手動選取並複製分鏡。");
    }
  }

  function handleApplyGptOutput() {
    const parsed = parseGptOutput(gptOutput);

    if (Object.keys(parsed).length === 0) {
      setGptImportMessage("找不到可辨識的段落，請確認內容包含標題、開場吸引句、腳本、行動呼籲、標籤或封面文字。");
      return;
    }

    setGeneratedScript((current) => ({
      ...current,
      ...parsed
    }));
    setGptImportMessage("已套用可辨識的 GPT 結果到預覽卡片。");
  }

  function handleSaveScript() {
    const now = new Date().toISOString();
    const savedScript: SavedScript = {
      id: crypto.randomUUID(),
      ...generatedScript,
      title: generatedScript.title,
      topic: formValues.topic,
      targetAudience: formValues.targetAudience,
      status: scriptStatus,
      createdAt: now,
      updatedAt: now
    };

    setSavedScripts((current) => [savedScript, ...current]);
    setLibraryMessage("已儲存到腳本庫。");
  }

  function handleLoadScript(script: SavedScript) {
    setGeneratedScript({
      title: script.title,
      hook: script.hook,
      script: script.script,
      cta: script.cta,
      hashtags: script.hashtags,
      coverText: script.coverText
    });
    setFormValues((current) => ({
      ...current,
      topic: script.topic,
      targetAudience: script.targetAudience
    }));
    setScriptStatus(script.status);
    setLibraryMessage("已載入腳本到預覽卡片。");
  }

  function handleDeleteScript(id: string) {
    setSavedScripts((current) => current.filter((script) => script.id !== id));
    setLibraryMessage("已刪除腳本。");
  }

  function handleFormChange(key: keyof ScriptGenerationForm, value: string) {
    setCopyMessage(null);
    setFormValues((current) => ({
      ...current,
      [key]: value
    }));
  }

  function handleUpdatePreviewField(key: ScriptPreviewKey, value: string) {
    setGeneratedScript((current) => ({
      ...current,
      [key]: value
    }));
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <section className="space-y-6">
        <PageHero />
        <TopicSelector />
        <StoryboardBuilder
          rows={storyboardRows}
          message={storyboardCopyMessage}
          onBuild={handleBuildStoryboard}
          onCopy={handleCopyStoryboard}
          onAdd={handleAddStoryboardRow}
          onDelete={handleDeleteStoryboardRow}
          onUpdate={handleUpdateStoryboardRow}
          onApplyCharacterLock={handleApplyCharacterLock}
          onApplyVoiceLock={handleApplyVoiceLock}
        />
        <AIImageStudio script={generatedScript} storyboardRows={storyboardRows} />
        <DigitalHumanStudio script={generatedScript} />
        <ThumbnailPromptBuilder
          prompt={thumbnailPrompt}
          style={thumbnailStyle}
          ratio={thumbnailRatio}
          includePerson={thumbnailIncludePerson}
          message={thumbnailCopyMessage}
          onCopy={handleCopyThumbnailPrompt}
          onStyleChange={(value) => {
            setThumbnailCopyMessage(null);
            setThumbnailStyle(value);
          }}
          onRatioChange={(value) => {
            setThumbnailCopyMessage(null);
            setThumbnailRatio(value);
          }}
          onIncludePersonChange={(value) => {
            setThumbnailCopyMessage(null);
            setThumbnailIncludePerson(value);
          }}
        />
        <ScriptLibrary
          scripts={savedScripts}
          status={scriptStatus}
          message={libraryMessage}
          onStatusChange={setScriptStatus}
          onSave={handleSaveScript}
          onLoad={handleLoadScript}
          onDelete={handleDeleteScript}
        />
        <GptOutputImport
          value={gptOutput}
          message={gptImportMessage}
          onChange={(value) => {
            setGptImportMessage(null);
            setGptOutput(value);
          }}
          onApply={handleApplyGptOutput}
        />
        <ScriptGenerator
          formValues={formValues}
          script={generatedScript}
          isGenerating={isGenerating}
          error={error}
          onFormChange={handleFormChange}
          onGenerate={handleGenerateScript}
          onScriptChange={handleUpdatePreviewField}
        />
        <GptMode
          prompt={gptPrompt}
          message={copyMessage}
          onCopy={handleCopyGptPrompt}
          onOpenChatGpt={handleOpenChatGpt}
        />
        <PromptBuilder />
        <ScriptWorkspace />
      </section>
      <ContentAssistant />
    </div>
  );
}
