"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

type ReferenceAngle = "front" | "45" | "side";

type CharacterReferenceImage = {
  angle: ReferenceAngle;
  fileName: string;
};

type CharacterProfile = {
  id: string;
  name: string;
  version: number;
  references: CharacterReferenceImage[];
  hairstyle: string;
  hairColor: string;
  outfit: string;
  expressions: string;
  brandAttributes: string;
  providerNotes: string;
  createdAt: string;
  updatedAt: string;
};

type CharacterForm = Omit<CharacterProfile, "id" | "createdAt" | "updatedAt">;

const STORAGE_KEY = "dailyos-character-library";
const angles: ReferenceAngle[] = ["front", "45", "side"];

const starterProfile: CharacterProfile = {
  id: "friendly-insurance-host",
  name: "Friendly Insurance Host",
  version: 1,
  references: [
    { angle: "front", fileName: "host-front.jpg" },
    { angle: "45", fileName: "host-45.jpg" },
    { angle: "side", fileName: "host-side.jpg" }
  ],
  hairstyle: "Shoulder-length natural brown hair",
  hairColor: "Warm brown",
  outfit: "Clean cream top with soft neutral styling",
  expressions: "Friendly smile, thoughtful pointing, warm encouragement",
  brandAttributes: "Trustworthy, warm, clear, professional, insurance education",
  providerNotes: "Keep face, hairstyle, outfit, body proportions, and tone consistent.",
  createdAt: "2026-07-04T00:00:00.000Z",
  updatedAt: "2026-07-04T00:00:00.000Z"
};

function emptyForm(): CharacterForm {
  return {
    name: "",
    version: 1,
    references: [],
    hairstyle: "",
    hairColor: "",
    outfit: "",
    expressions: "",
    brandAttributes: "",
    providerNotes: ""
  };
}

function toForm(profile: CharacterProfile): CharacterForm {
  return {
    name: profile.name,
    version: profile.version,
    references: profile.references,
    hairstyle: profile.hairstyle,
    hairColor: profile.hairColor,
    outfit: profile.outfit,
    expressions: profile.expressions,
    brandAttributes: profile.brandAttributes,
    providerNotes: profile.providerNotes
  };
}

function fileName(files: FileList | null) {
  return files?.[0]?.name ?? "";
}

function buildPrompt(profile: CharacterProfile) {
  return [
    `Character: ${profile.name} v${profile.version}`,
    `Reference images: ${profile.references
      .map((image) => `${image.angle}: ${image.fileName}`)
      .join(", ") || "none"}`,
    `Hair: ${profile.hairstyle}; color: ${profile.hairColor}`,
    `Outfit: ${profile.outfit}`,
    `Expressions: ${profile.expressions}`,
    `Brand attributes: ${profile.brandAttributes}`,
    `Consistency lock: preserve face, hairstyle, hair color, outfit, body proportions, expression range, and brand style across every storyboard image and video clip.`,
    `Provider notes: ${profile.providerNotes || "provider-agnostic"}`
  ].join("\n");
}

export function CharacterPage() {
  const [profiles, setProfiles] = useState<CharacterProfile[]>([starterProfile]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CharacterForm>(() => toForm(starterProfile));
  const [message, setMessage] = useState<string | null>(null);

  const selectedProfile =
    profiles.find((profile) => profile.id === editingId) ?? profiles[0] ?? starterProfile;
  const promptPackage = useMemo(() => buildPrompt(selectedProfile), [selectedProfile]);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      setHasLoaded(true);
      return;
    }

    try {
      const parsed = JSON.parse(saved) as CharacterProfile[];
      if (Array.isArray(parsed)) {
        setProfiles(parsed);
        setForm(parsed[0] ? toForm(parsed[0]) : emptyForm());
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setHasLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (hasLoaded) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
    }
  }, [hasLoaded, profiles]);

  function updateReference(angle: ReferenceAngle, fileNameValue: string) {
    setForm((current) => ({
      ...current,
      references: [
        ...current.references.filter((image) => image.angle !== angle),
        ...(fileNameValue ? [{ angle, fileName: fileNameValue }] : [])
      ].sort((a, b) => angles.indexOf(a.angle) - angles.indexOf(b.angle))
    }));
  }

  function saveProfile() {
    if (!form.name.trim()) {
      setMessage("請先輸入模板名稱。");
      return;
    }

    const now = new Date().toISOString();

    if (editingId) {
      setProfiles((current) =>
        current.map((profile) =>
          profile.id === editingId
            ? { ...profile, ...form, name: form.name.trim(), updatedAt: now }
            : profile
        )
      );
      setMessage("人物模板已更新。");
      return;
    }

    const profile: CharacterProfile = {
      id: crypto.randomUUID(),
      ...form,
      name: form.name.trim(),
      createdAt: now,
      updatedAt: now
    };

    setProfiles((current) => [profile, ...current]);
    setEditingId(profile.id);
    setMessage("人物模板已建立。");
  }

  function editProfile(profile: CharacterProfile) {
    setEditingId(profile.id);
    setForm(toForm(profile));
    setMessage(null);
  }

  function deleteProfile(id: string) {
    setProfiles((current) => current.filter((profile) => profile.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setForm(emptyForm());
    }
    setMessage("人物模板已刪除。");
  }

  function newVersion(profile: CharacterProfile) {
    const now = new Date().toISOString();
    const nextProfile = {
      ...profile,
      id: crypto.randomUUID(),
      version: profile.version + 1,
      createdAt: now,
      updatedAt: now
    };

    setProfiles((current) => [nextProfile, ...current]);
    setEditingId(nextProfile.id);
    setForm(toForm(nextProfile));
    setMessage(`已建立 v${nextProfile.version}。`);
  }

  function exportJson(profile: CharacterProfile) {
    const blob = new Blob([JSON.stringify(profile, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${profile.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-v${profile.version}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function copyPrompt() {
    if (!navigator.clipboard?.writeText) {
      setMessage("剪貼簿不可用，請直接複製下方提示詞包。");
      return;
    }

    await navigator.clipboard.writeText(promptPackage);
    setMessage("人物提示詞包已複製。");
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">人物模板</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-normal">
              人物模板庫
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              建立可重用的主持人人物設定，保存參考圖片、固定外觀特徵、版本與可匯出的提示詞包。
            </p>
          </div>
          <Badge variant="secondary" className="w-fit">
            localStorage MVP
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>{editingId ? "編輯人物模板" : "建立人物模板"}</CardTitle>
                <CardDescription>
                  參考檔案目前保留在本機；DailyOS 只儲存檔名與人物設定。
                </CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm());
                  setMessage(null);
                }}
              >
                新增模板
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {message ? (
              <p className="rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground">
                {message}
              </p>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium">模板名稱</span>
                <input
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, name: event.target.value }))
                  }
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium">版本</span>
                <input
                  type="number"
                  min="1"
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={form.version}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      version: Number(event.target.value) || 1
                    }))
                  }
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {angles.map((angle) => (
                <label key={angle} className="space-y-2 rounded-md border bg-secondary/30 p-3">
                  <span className="text-sm font-medium">{angle} 參考圖</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full text-sm text-muted-foreground"
                    onChange={(event) => updateReference(angle, fileName(event.target.files))}
                  />
                  <span className="block truncate text-xs text-muted-foreground">
                    {form.references.find((image) => image.angle === angle)?.fileName ||
                      "尚未選擇檔案"}
                  </span>
                </label>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <TextField
                label="髮型"
                value={form.hairstyle}
                onChange={(value) => setForm((current) => ({ ...current, hairstyle: value }))}
              />
              <TextField
                label="髮色"
                value={form.hairColor}
                onChange={(value) => setForm((current) => ({ ...current, hairColor: value }))}
              />
              <TextField
                label="穿搭"
                value={form.outfit}
                onChange={(value) => setForm((current) => ({ ...current, outfit: value }))}
              />
              <TextField
                label="表情與手勢"
                value={form.expressions}
                onChange={(value) => setForm((current) => ({ ...current, expressions: value }))}
              />
              <TextField
                label="品牌特質"
                value={form.brandAttributes}
                onChange={(value) =>
                  setForm((current) => ({ ...current, brandAttributes: value }))
                }
              />
              <TextField
                label="Provider 備註"
                value={form.providerNotes}
                onChange={(value) => setForm((current) => ({ ...current, providerNotes: value }))}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={saveProfile}>{editingId ? "儲存變更" : "建立模板"}</Button>
              <Button variant="outline" onClick={copyPrompt}>
                複製提示詞包
              </Button>
              <Button variant="outline" onClick={() => exportJson(selectedProfile)}>
                匯出選取 JSON
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>可重用人物提示詞包</CardTitle>
            <CardDescription>
              可交給未來圖片、影片或 OpenMontage 流程使用的 provider-agnostic 提示詞包。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="max-h-72 overflow-auto whitespace-pre-wrap break-words rounded-md bg-secondary/40 p-3 text-sm leading-6 text-muted-foreground">
              {promptPackage}
            </pre>
          </CardContent>
        </Card>
      </section>

      <aside className="space-y-4">
        <Card className="xl:sticky xl:top-24">
          <CardHeader>
            <CardTitle>人物模板</CardTitle>
            <CardDescription>{profiles.length} 個已儲存人物模板</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {profiles.map((profile) => (
              <article
                key={profile.id}
                className="rounded-md border bg-background p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{profile.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      v{profile.version} - {profile.references.length} 張參考圖
                    </p>
                  </div>
                  <Badge variant={profile.id === selectedProfile.id ? "default" : "outline"}>
                    {profile.id === selectedProfile.id ? "已選取" : "資料庫"}
                  </Badge>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button variant="secondary" size="sm" onClick={() => editProfile(profile)}>
                    編輯
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => newVersion(profile)}>
                    新版本
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => exportJson(profile)}>
                    匯出
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => deleteProfile(profile.id)}>
                    刪除
                  </Button>
                </div>
              </article>
            ))}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium">{label}</span>
      <input
        className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
