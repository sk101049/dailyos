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

type Asset = {
  id: string;
  title?: string;
  name?: string;
  platform?: string;
};

type ProjectStatus = "active" | "archived";

type CreatorProject = {
  id: string;
  name: string;
  description: string;
  brand: string;
  defaultCharacterId: string;
  defaultVoiceId: string;
  defaultVideoProvider: string;
  scriptIds: string[];
  storyboardIds: string[];
  videoIds: string[];
  calendarItemIds: string[];
  publishingItemIds: string[];
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
};

type ProjectForm = Omit<CreatorProject, "id" | "status" | "createdAt" | "updatedAt">;

const PROJECTS_KEY = "dailyos-projects";
const ACTIVE_PROJECT_KEY = "dailyos-active-project-id";
const SCRIPT_KEY = "dailyos-script-library";
const CHARACTER_KEY = "dailyos-character-library";
const VOICE_KEY = "dailyos-voice-library";
const STORYBOARD_KEY = "dailyos-storyboard-v2";
const PACKAGE_KEY = "dailyos-video-packages";
const CALENDAR_KEY = "dailyos-content-calendar";
const PUBLISHING_KEY = "dailyos-publishing-center";

const emptyForm: ProjectForm = {
  name: "",
  description: "",
  brand: "",
  defaultCharacterId: "",
  defaultVoiceId: "",
  defaultVideoProvider: "Gemini",
  scriptIds: [],
  storyboardIds: [],
  videoIds: [],
  calendarItemIds: [],
  publishingItemIds: []
};

function readArray<T>(key: string): T[] {
  try {
    const saved = window.localStorage.getItem(key);
    const parsed = saved ? (JSON.parse(saved) as T[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function labelFor(asset: Asset) {
  return asset.title ?? asset.name ?? asset.id;
}

function toggleId(ids: string[], id: string) {
  return ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id];
}

export function ProjectPage() {
  const [projects, setProjects] = useState<CreatorProject[]>([]);
  const [activeProjectId, setActiveProjectId] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProjectForm>(emptyForm);
  const [scripts, setScripts] = useState<Asset[]>([]);
  const [characters, setCharacters] = useState<Asset[]>([]);
  const [voices, setVoices] = useState<Asset[]>([]);
  const [storyboards, setStoryboards] = useState<Asset[]>([]);
  const [videos, setVideos] = useState<Asset[]>([]);
  const [calendarItems, setCalendarItems] = useState<Asset[]>([]);
  const [publishingItems, setPublishingItems] = useState<Asset[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadedProjects = readArray<CreatorProject>(PROJECTS_KEY);

    setProjects(loadedProjects);
    setActiveProjectId(window.localStorage.getItem(ACTIVE_PROJECT_KEY) ?? loadedProjects[0]?.id ?? "");
    setScripts(readArray<Asset>(SCRIPT_KEY));
    setCharacters(readArray<Asset>(CHARACTER_KEY));
    setVoices(readArray<Asset>(VOICE_KEY));
    setStoryboards(readArray<Asset>(STORYBOARD_KEY));
    setVideos(readArray<Asset>(PACKAGE_KEY));
    setCalendarItems(readArray<Asset>(CALENDAR_KEY));
    setPublishingItems(readArray<Asset>(PUBLISHING_KEY));
  }, []);

  const activeProject = useMemo(
    () => projects.find((project) => project.id === activeProjectId) ?? null,
    [activeProjectId, projects]
  );

  function persist(next: CreatorProject[]) {
    setProjects(next);
    window.localStorage.setItem(PROJECTS_KEY, JSON.stringify(next));
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  function saveProject() {
    if (!form.name.trim()) {
      setMessage("請先輸入專案名稱。");
      return;
    }

    const now = new Date().toISOString();
    const nextProject: CreatorProject = {
      ...form,
      id: editingId ?? crypto.randomUUID(),
      status: projects.find((project) => project.id === editingId)?.status ?? "active",
      createdAt: projects.find((project) => project.id === editingId)?.createdAt ?? now,
      updatedAt: now
    };
    const next = editingId
      ? projects.map((project) => (project.id === editingId ? nextProject : project))
      : [nextProject, ...projects];

    persist(next);
    setActive(nextProject.id);
    resetForm();
    setMessage("專案已儲存。");
  }

  function editProject(project: CreatorProject) {
    setEditingId(project.id);
    setForm({
      name: project.name,
      description: project.description,
      brand: project.brand,
      defaultCharacterId: project.defaultCharacterId,
      defaultVoiceId: project.defaultVoiceId,
      defaultVideoProvider: project.defaultVideoProvider,
      scriptIds: project.scriptIds,
      storyboardIds: project.storyboardIds,
      videoIds: project.videoIds,
      calendarItemIds: project.calendarItemIds,
      publishingItemIds: project.publishingItemIds
    });
  }

  function setActive(id: string) {
    setActiveProjectId(id);
    window.localStorage.setItem(ACTIVE_PROJECT_KEY, id);
  }

  function archiveProject(project: CreatorProject) {
    persist(projects.map((item) => item.id === project.id ? { ...item, status: "archived", updatedAt: new Date().toISOString() } : item));
    if (activeProjectId === project.id) {
      window.localStorage.removeItem(ACTIVE_PROJECT_KEY);
      setActiveProjectId("");
    }
  }

  function deleteProject(id: string) {
    persist(projects.filter((project) => project.id !== id));
    if (activeProjectId === id) {
      window.localStorage.removeItem(ACTIVE_PROJECT_KEY);
      setActiveProjectId("");
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="space-y-6">
        <div>
          <p className="text-sm font-medium text-primary">專案工作室</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-normal">創作專案中心</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            管理專案中使用的腳本、分鏡、影片、行事曆與發布項目。所有資料都保存在本機。
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "編輯專案" : "建立專案"}</CardTitle>
            <CardDescription>設定預設人物、聲音、影片服務，並連結現有資產。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {message ? (
              <p className="rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground">{message}</p>
            ) : null}
            <div className="grid gap-4 md:grid-cols-2">
              <TextField label="專案名稱" value={form.name} onChange={(value) => setForm({ ...form, name: value })} />
              <TextField label="品牌" value={form.brand} onChange={(value) => setForm({ ...form, brand: value })} />
              <SelectField
                label="預設人物"
                value={form.defaultCharacterId}
                placeholder="選擇人物..."
                options={characters}
                onChange={(value) => setForm({ ...form, defaultCharacterId: value })}
              />
              <SelectField
                label="預設聲音"
                value={form.defaultVoiceId}
                placeholder="選擇聲音..."
                options={voices}
                onChange={(value) => setForm({ ...form, defaultVoiceId: value })}
              />
              <SelectField
                label="預設影片服務"
                value={form.defaultVideoProvider}
                placeholder="選擇 provider..."
                options={[{ id: "Gemini", title: "Gemini" }, { id: "OpenMontage", title: "OpenMontage" }]}
                onChange={(value) => setForm({ ...form, defaultVideoProvider: value })}
              />
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium">專案描述</span>
                <textarea
                  className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <AssetPicker title="腳本" assets={scripts} selectedIds={form.scriptIds} onToggle={(id) => setForm({ ...form, scriptIds: toggleId(form.scriptIds, id) })} />
              <AssetPicker title="分鏡" assets={storyboards} selectedIds={form.storyboardIds} onToggle={(id) => setForm({ ...form, storyboardIds: toggleId(form.storyboardIds, id) })} />
              <AssetPicker title="影片製作包" assets={videos} selectedIds={form.videoIds} onToggle={(id) => setForm({ ...form, videoIds: toggleId(form.videoIds, id) })} />
              <AssetPicker title="行事曆項目" assets={calendarItems} selectedIds={form.calendarItemIds} onToggle={(id) => setForm({ ...form, calendarItemIds: toggleId(form.calendarItemIds, id) })} />
              <AssetPicker title="發布項目" assets={publishingItems} selectedIds={form.publishingItemIds} onToggle={(id) => setForm({ ...form, publishingItemIds: toggleId(form.publishingItemIds, id) })} />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={saveProject}>{editingId ? "更新專案" : "建立專案"}</Button>
              <Button variant="outline" onClick={resetForm}>清空表單</Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((project) => (
            <Card key={project.id} className={project.status === "archived" ? "opacity-70" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle>{project.name}</CardTitle>
                    <CardDescription>{project.description || "尚無描述"}</CardDescription>
                  </div>
                  <Badge variant={project.id === activeProjectId ? "default" : "outline"}>
                    {project.id === activeProjectId ? "使用中" : project.status === "archived" ? "已封存" : "可用"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <SummaryRow label="品牌" value={project.brand || "未設定"} />
                <SummaryRow label="影片服務" value={project.defaultVideoProvider} />
                <SummaryRow label="已連結資產" value={`${project.scriptIds.length + project.storyboardIds.length + project.videoIds.length + project.calendarItemIds.length + project.publishingItemIds.length}`} />
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => setActive(project.id)} disabled={project.status === "archived"}>設為目前專案</Button>
                  <Button size="sm" variant="outline" onClick={() => editProject(project)}>編輯</Button>
                  <Button size="sm" variant="outline" onClick={() => archiveProject(project)}>封存</Button>
                  <Button size="sm" variant="outline" onClick={() => deleteProject(project.id)}>刪除</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <aside className="space-y-4">
        <Card className="xl:sticky xl:top-24">
          <CardHeader>
            <CardTitle>目前專案</CardTitle>
            <CardDescription>儀表板和製作流程精靈會優先使用這個專案。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <SummaryRow label="名稱" value={activeProject?.name ?? "尚未選擇"} />
            <SummaryRow label="品牌" value={activeProject?.brand ?? "未設定"} />
            <SummaryRow label="影片服務" value={activeProject?.defaultVideoProvider ?? "Gemini"} />
            <SummaryRow label="腳本" value={String(activeProject?.scriptIds.length ?? 0)} />
            <SummaryRow label="影片" value={String(activeProject?.videoIds.length ?? 0)} />
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
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
  placeholder,
  onChange
}: {
  label: string;
  value: string;
  options: Asset[];
  placeholder: string;
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
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {labelFor(option)}
          </option>
        ))}
      </select>
    </label>
  );
}

function AssetPicker({
  title,
  assets,
  selectedIds,
  onToggle
}: {
  title: string;
  assets: Asset[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="rounded-md border bg-background p-3">
      <p className="text-sm font-medium">{title}</p>
      <div className="mt-3 max-h-48 space-y-2 overflow-auto">
        {assets.length === 0 ? (
          <p className="text-sm text-muted-foreground">尚無可連結資產。</p>
        ) : (
          assets.map((asset) => (
            <label key={asset.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selectedIds.includes(asset.id)}
                onChange={() => onToggle(asset.id)}
              />
              <span>{labelFor(asset)}</span>
            </label>
          ))
        )}
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-md border bg-background px-3 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="max-w-44 text-right font-medium">{value}</span>
    </div>
  );
}
