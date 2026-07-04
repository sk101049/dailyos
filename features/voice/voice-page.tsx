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

type VoicePreset = "生活化聊天" | "專業教學" | "溫柔說明" | "活潑短影音";

type VoiceProfile = {
  id: string;
  name: string;
  genderAge: string;
  speakingStyle: string;
  tone: string;
  speed: string;
  pauseLevel: string;
  emotionalWarmth: string;
  formalityLevel: string;
  preset: VoicePreset;
  providerNotes: string;
  legalUseNote: string;
  createdAt: string;
  updatedAt: string;
};

type VoiceForm = Omit<VoiceProfile, "id" | "createdAt" | "updatedAt">;

type SavedScriptSummary = {
  id: string;
  title: string;
  script: string;
};

const STORAGE_KEY = "dailyos-voice-library";
const SCRIPT_LIBRARY_STORAGE_KEY = "dailyos-script-library";

const presets: Record<VoicePreset, Partial<VoiceForm>> = {
  生活化聊天: {
    speakingStyle: "像朋友聊天，句子短，口氣自然",
    tone: "親切、生活化",
    speed: "Medium",
    pauseLevel: "Medium",
    emotionalWarmth: "High",
    formalityLevel: "Casual"
  },
  專業教學: {
    speakingStyle: "清楚解釋，條理分明，保留專業感",
    tone: "穩定、可信任",
    speed: "Medium",
    pauseLevel: "Medium",
    emotionalWarmth: "Medium",
    formalityLevel: "Professional"
  },
  溫柔說明: {
    speakingStyle: "柔和說明，放慢節奏，避免壓迫感",
    tone: "溫暖、安心",
    speed: "Slow",
    pauseLevel: "High",
    emotionalWarmth: "High",
    formalityLevel: "Warm"
  },
  活潑短影音: {
    speakingStyle: "節奏明快，開頭有力，適合短影音",
    tone: "活潑、有能量",
    speed: "Fast",
    pauseLevel: "Low",
    emotionalWarmth: "Medium",
    formalityLevel: "Casual"
  }
};

const starterProfile: VoiceProfile = {
  id: "warm-insurance-educator",
  name: "Warm Insurance Educator",
  genderAge: "Female, 30-40",
  speakingStyle: "Friendly, conversational, clear Traditional Chinese",
  tone: "Warm and professional",
  speed: "Medium",
  pauseLevel: "Medium",
  emotionalWarmth: "High",
  formalityLevel: "Professional",
  preset: "專業教學",
  providerNotes: "Provider-agnostic. Future adapters can map this to Piper, ElevenLabs, OpenAI TTS, or Azure Speech.",
  legalUseNote: "Use only legally owned or explicitly permitted voice samples in future integrations.",
  createdAt: "2026-07-04T00:00:00.000Z",
  updatedAt: "2026-07-04T00:00:00.000Z"
};

function emptyForm(): VoiceForm {
  return {
    name: "",
    genderAge: "",
    speakingStyle: "",
    tone: "",
    speed: "Medium",
    pauseLevel: "Medium",
    emotionalWarmth: "Medium",
    formalityLevel: "Professional",
    preset: "專業教學",
    providerNotes: "",
    legalUseNote: "Use only legally owned or explicitly permitted voice samples in future integrations."
  };
}

function toForm(profile: VoiceProfile): VoiceForm {
  return {
    name: profile.name,
    genderAge: profile.genderAge,
    speakingStyle: profile.speakingStyle,
    tone: profile.tone,
    speed: profile.speed,
    pauseLevel: profile.pauseLevel,
    emotionalWarmth: profile.emotionalWarmth,
    formalityLevel: profile.formalityLevel,
    preset: profile.preset,
    providerNotes: profile.providerNotes,
    legalUseNote: profile.legalUseNote
  };
}

function buildPrompt(profile: VoiceProfile) {
  return [
    `Voice profile: ${profile.name}`,
    `Gender / age range: ${profile.genderAge}`,
    `Preset: ${profile.preset}`,
    `Speaking style: ${profile.speakingStyle}`,
    `Tone: ${profile.tone}`,
    `Speed: ${profile.speed}`,
    `Pause level: ${profile.pauseLevel}`,
    `Emotional warmth: ${profile.emotionalWarmth}`,
    `Formality level: ${profile.formalityLevel}`,
    `Legal note: ${profile.legalUseNote}`,
    `Provider notes: ${profile.providerNotes || "provider-agnostic"}`,
    "TTS provider targets: Piper, ElevenLabs, OpenAI TTS, Azure Speech."
  ].join("\n");
}

function optimizeSpeech(text: string) {
  return text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) =>
      line
        .replace(/您/g, "你")
        .replace(/是否/g, "是不是")
        .replace(/因此/g, "所以")
        .replace(/然而/g, "不過")
        .replace(/[。！？]/g, (match) => `${match}\n[pause]\n`)
        .replace(/(重點|提醒|注意|一定|不是|保障|風險)/g, "**$1**")
        .replace(/\s+/g, " ")
        .trim()
    )
    .join("\n")
    .replace(/\n{3,}/g, "\n\n");
}

export function VoicePage() {
  const [profiles, setProfiles] = useState<VoiceProfile[]>([starterProfile]);
  const [scripts, setScripts] = useState<SavedScriptSummary[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(starterProfile.id);
  const [form, setForm] = useState<VoiceForm>(() => toForm(starterProfile));
  const [scriptInput, setScriptInput] = useState("");
  const [optimizedScript, setOptimizedScript] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const selectedProfile =
    profiles.find((profile) => profile.id === editingId) ?? profiles[0] ?? starterProfile;
  const promptPackage = useMemo(() => buildPrompt(selectedProfile), [selectedProfile]);

  useEffect(() => {
    const savedProfiles = window.localStorage.getItem(STORAGE_KEY);
    const savedScripts = window.localStorage.getItem(SCRIPT_LIBRARY_STORAGE_KEY);

    if (savedProfiles) {
      try {
        const parsed = JSON.parse(savedProfiles) as VoiceProfile[];
        if (Array.isArray(parsed)) {
          setProfiles(parsed);
          setEditingId(parsed[0]?.id ?? null);
          setForm(parsed[0] ? toForm(parsed[0]) : emptyForm());
        }
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }

    if (savedScripts) {
      try {
        const parsed = JSON.parse(savedScripts) as SavedScriptSummary[];
        if (Array.isArray(parsed)) {
          setScripts(parsed.filter((script) => script.id && script.title && script.script));
        }
      } catch {
        setScripts([]);
      }
    }

    setHasLoaded(true);
  }, []);

  useEffect(() => {
    if (hasLoaded) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
    }
  }, [hasLoaded, profiles]);

  function applyPreset(preset: VoicePreset) {
    setForm((current) => ({
      ...current,
      preset,
      ...presets[preset]
    }));
  }

  function saveProfile() {
    if (!form.name.trim()) {
      setMessage("Profile name is required.");
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
      setMessage("Voice profile updated.");
      return;
    }

    const profile: VoiceProfile = {
      id: crypto.randomUUID(),
      ...form,
      name: form.name.trim(),
      createdAt: now,
      updatedAt: now
    };

    setProfiles((current) => [profile, ...current]);
    setEditingId(profile.id);
    setMessage("Voice profile created.");
  }

  function editProfile(profile: VoiceProfile) {
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
    setMessage("Voice profile deleted.");
  }

  function exportJson(profile: VoiceProfile) {
    const blob = new Blob([JSON.stringify(profile, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${profile.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function copyPrompt() {
    if (!navigator.clipboard?.writeText) {
      setMessage("Clipboard is unavailable. Prompt package is visible below.");
      return;
    }

    await navigator.clipboard.writeText(promptPackage);
    setMessage("Voice prompt package copied.");
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Voice Studio</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-normal">Voice Library</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Create reusable narration identities, optimize scripts for spoken Traditional
              Chinese, and export provider-agnostic voice prompt packages.
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
                <CardTitle>{editingId ? "Edit Voice Profile" : "Create Voice Profile"}</CardTitle>
                <CardDescription>
                  No TTS or voice cloning is called. This stores identity settings only.
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
                New Profile
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
              <TextField
                label="Name"
                value={form.name}
                onChange={(value) => setForm((current) => ({ ...current, name: value }))}
              />
              <TextField
                label="Gender / age range"
                value={form.genderAge}
                onChange={(value) => setForm((current) => ({ ...current, genderAge: value }))}
              />
            </div>

            <div className="grid gap-2 md:grid-cols-4">
              {Object.keys(presets).map((preset) => (
                <Button
                  key={preset}
                  type="button"
                  variant={form.preset === preset ? "default" : "outline"}
                  onClick={() => applyPreset(preset as VoicePreset)}
                >
                  {preset}
                </Button>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <TextField
                label="Speaking style"
                value={form.speakingStyle}
                onChange={(value) =>
                  setForm((current) => ({ ...current, speakingStyle: value }))
                }
              />
              <TextField
                label="Tone"
                value={form.tone}
                onChange={(value) => setForm((current) => ({ ...current, tone: value }))}
              />
              <SelectField
                label="Speed"
                value={form.speed}
                options={["Slow", "Medium", "Fast"]}
                onChange={(value) => setForm((current) => ({ ...current, speed: value }))}
              />
              <SelectField
                label="Pause level"
                value={form.pauseLevel}
                options={["Low", "Medium", "High"]}
                onChange={(value) => setForm((current) => ({ ...current, pauseLevel: value }))}
              />
              <SelectField
                label="Emotional warmth"
                value={form.emotionalWarmth}
                options={["Low", "Medium", "High"]}
                onChange={(value) =>
                  setForm((current) => ({ ...current, emotionalWarmth: value }))
                }
              />
              <SelectField
                label="Formality level"
                value={form.formalityLevel}
                options={["Casual", "Warm", "Professional"]}
                onChange={(value) =>
                  setForm((current) => ({ ...current, formalityLevel: value }))
                }
              />
              <TextField
                label="Provider notes"
                value={form.providerNotes}
                onChange={(value) =>
                  setForm((current) => ({ ...current, providerNotes: value }))
                }
              />
              <TextField
                label="Legal use note"
                value={form.legalUseNote}
                onChange={(value) =>
                  setForm((current) => ({ ...current, legalUseNote: value }))
                }
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={saveProfile}>{editingId ? "Save Changes" : "Create Profile"}</Button>
              <Button variant="outline" onClick={copyPrompt}>
                Copy Prompt Package
              </Button>
              <Button variant="outline" onClick={() => exportJson(selectedProfile)}>
                Export Selected JSON
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Speech Optimizer</CardTitle>
            <CardDescription>
              Paste a script or load one from Script Library, then rewrite it for spoken zh-TW.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {scripts.length > 0 ? (
              <select
                className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                defaultValue=""
                onChange={(event) => {
                  const script = scripts.find((item) => item.id === event.target.value);
                  if (script) {
                    setScriptInput(script.script);
                  }
                }}
              >
                <option value="">Load a saved script...</option>
                {scripts.map((script) => (
                  <option key={script.id} value={script.id}>
                    {script.title}
                  </option>
                ))}
              </select>
            ) : null}
            <textarea
              className="min-h-40 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={scriptInput}
              onChange={(event) => setScriptInput(event.target.value)}
              placeholder="Paste script here..."
            />
            <Button onClick={() => setOptimizedScript(optimizeSpeech(scriptInput))}>
              Optimize for Speech
            </Button>
            <pre className="max-h-72 overflow-auto whitespace-pre-wrap break-words rounded-md bg-secondary/40 p-3 text-sm leading-6 text-muted-foreground">
              {optimizedScript || "Optimized spoken Traditional Chinese will appear here."}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reusable Voice Prompt Package</CardTitle>
            <CardDescription>
              Provider-agnostic package for future Piper, ElevenLabs, OpenAI TTS, or Azure Speech adapters.
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
            <CardTitle>Profiles</CardTitle>
            <CardDescription>{profiles.length} saved voice profiles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {profiles.map((profile) => (
              <article key={profile.id} className="rounded-md border bg-background p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{profile.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {profile.preset} - {profile.speed}
                    </p>
                  </div>
                  <Badge variant={profile.id === selectedProfile.id ? "default" : "outline"}>
                    {profile.id === selectedProfile.id ? "Selected" : "Library"}
                  </Badge>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button variant="secondary" size="sm" onClick={() => editProfile(profile)}>
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => exportJson(profile)}>
                    Export
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => deleteProfile(profile.id)}>
                    Delete
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

function SelectField({
  label,
  value,
  options,
  onChange
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium">{label}</span>
      <select
        className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
