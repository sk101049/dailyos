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
import { readRenderQueue, writeRenderQueue, type RenderJob } from "@/lib/render-queue";

type Asset = {
  id: string;
  title?: string;
  name?: string;
};

type WorkflowNode = {
  id: string;
  label: string;
  enabled: boolean;
  requiresApproval: boolean;
  defaultProvider: string;
};

type WorkflowTemplate = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  nodes: WorkflowNode[];
};

type WeeklyPlanItem = {
  id: string;
  dateLabel: string;
  title: string;
  category: string;
  status: string;
  projectId: string;
  renderJobId: string;
};

type DirectorDraft = {
  id: string;
  projectId: string;
  title: string;
  category: string;
  prompt: string;
  status: string;
  createdAt: string;
};

const WORKFLOW_KEY = "dailyos-workflow-templates";
const WEEKLY_PLAN_KEY = "dailyos-weekly-production-plan";
const DIRECTOR_DRAFT_KEY = "dailyos-ai-director-drafts";
const PROJECTS_KEY = "dailyos-projects";
const BRAND_KEY = "dailyos-brand-library";
const CHARACTER_KEY = "dailyos-character-library";
const VOICE_KEY = "dailyos-voice-library";

const nodeLabels = [
  "AI 導演",
  "腳本",
  "分鏡",
  "人物模板",
  "配音",
  "品牌",
  "生成佇列",
  "Gemini",
  "OpenMontage",
  "審核",
  "素材庫",
  "發布中心"
];

const providers = ["Gemini", "OpenMontage", "Runway", "Kling", "Pika", "Hailuo"];
const categories = ["AI", "財經", "房地產", "保險", "健康", "美食", "科技", "旅遊", "親子", "自訂"];

function defaultNodes(): WorkflowNode[] {
  return nodeLabels.map((label) => ({
    id: crypto.randomUUID(),
    label,
    enabled: true,
    requiresApproval: ["AI 導演", "審核", "生成佇列", "發布中心"].includes(label),
    defaultProvider: label === "OpenMontage" ? "OpenMontage" : "Gemini"
  }));
}

function readArray<T>(key: string): T[] {
  try {
    const saved = window.localStorage.getItem(key);
    const parsed = saved ? (JSON.parse(saved) as T[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function titleOf(asset: Asset) {
  return asset.title ?? asset.name ?? asset.id;
}

function move<T>(items: T[], from: number, to: number) {
  if (to < 0 || to >= items.length) {
    return items;
  }

  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function WorkflowPage() {
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [templateName, setTemplateName] = useState("短影音製作流程");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [brands, setBrands] = useState<Asset[]>([]);
  const [characters, setCharacters] = useState<Asset[]>([]);
  const [voices, setVoices] = useState<Asset[]>([]);
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlanItem[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [producer, setProducer] = useState({
    cadence: "每天 3 支短影音",
    category: "保險",
    brandId: "",
    characterId: "",
    voiceId: "",
    workflowTemplateId: "",
    provider: "Gemini"
  });

  useEffect(() => {
    const loadedTemplates = readArray<WorkflowTemplate>(WORKFLOW_KEY);
    const initialNodes = loadedTemplates[0]?.nodes ?? defaultNodes();

    setTemplates(loadedTemplates);
    setNodes(initialNodes);
    setSelectedTemplateId(loadedTemplates[0]?.id ?? "");
    setProducer((current) => ({ ...current, workflowTemplateId: loadedTemplates[0]?.id ?? "" }));
    setBrands(readArray<Asset>(BRAND_KEY));
    setCharacters(readArray<Asset>(CHARACTER_KEY));
    setVoices(readArray<Asset>(VOICE_KEY));
    setWeeklyPlan(readArray<WeeklyPlanItem>(WEEKLY_PLAN_KEY));
  }, []);

  const enabledCount = nodes.filter((node) => node.enabled).length;
  const approvalCount = nodes.filter((node) => node.enabled && node.requiresApproval).length;
  const planCount = producer.cadence.includes("每天") ? 15 : 2;

  function persistTemplates(next: WorkflowTemplate[]) {
    setTemplates(next);
    window.localStorage.setItem(WORKFLOW_KEY, JSON.stringify(next));
  }

  function updateNode(id: string, patch: Partial<WorkflowNode>) {
    setNodes((current) => current.map((node) => node.id === id ? { ...node, ...patch } : node));
  }

  function saveTemplate() {
    if (!templateName.trim()) {
      setMessage("請先輸入流程模板名稱。");
      return;
    }

    const now = new Date().toISOString();
    const template: WorkflowTemplate = {
      id: selectedTemplateId || crypto.randomUUID(),
      name: templateName,
      createdAt: templates.find((item) => item.id === selectedTemplateId)?.createdAt ?? now,
      updatedAt: now,
      nodes
    };
    const next = selectedTemplateId
      ? templates.map((item) => item.id === selectedTemplateId ? template : item)
      : [template, ...templates];

    persistTemplates(next);
    setSelectedTemplateId(template.id);
    setProducer((current) => ({ ...current, workflowTemplateId: template.id }));
    setMessage("流程模板已儲存。");
  }

  function loadTemplate(id: string) {
    const template = templates.find((item) => item.id === id);
    if (!template) {
      return;
    }

    setSelectedTemplateId(id);
    setTemplateName(template.name);
    setNodes(template.nodes);
    setProducer((current) => ({ ...current, workflowTemplateId: id }));
  }

  function createWeeklyPlan() {
    const now = new Date().toISOString();
    const projects = readArray<Record<string, unknown>>(PROJECTS_KEY);
    const drafts = readArray<DirectorDraft>(DIRECTOR_DRAFT_KEY);
    const queue = readRenderQueue();
    const template = templates.find((item) => item.id === producer.workflowTemplateId);
    const brandName = brands.find((item) => item.id === producer.brandId)?.name ?? "未設定品牌";
    const characterName = characters.find((item) => item.id === producer.characterId)?.name ?? "待選人物";
    const voiceName = voices.find((item) => item.id === producer.voiceId)?.name ?? "待選配音";
    const createdPlan: WeeklyPlanItem[] = Array.from({ length: planCount }, (_, index) => {
      const projectId = crypto.randomUUID();
      const renderJobId = crypto.randomUUID();
      const title = `${producer.category} ${producer.cadence.includes("短影音") ? "短影音" : "長影片"} #${index + 1}`;
      const status = index % 3 === 0 ? "待腳本" : index % 3 === 1 ? "待生成" : "待發布";
      const dateLabel = index < 3 ? "今天" : `本週第 ${Math.floor(index / 3) + 1} 天`;
      const project = {
        id: projectId,
        name: title,
        description: `AI 製作人建立，${producer.cadence}，${brandName}`,
        brand: brandName,
        defaultCharacterId: producer.characterId,
        defaultVoiceId: producer.voiceId,
        defaultVideoProvider: producer.provider,
        scriptIds: [],
        storyboardIds: [],
        videoIds: [],
        calendarItemIds: [],
        publishingItemIds: [],
        status: "待審核",
        createdAt: now,
        updatedAt: now
      };
      const draft: DirectorDraft = {
        id: crypto.randomUUID(),
        projectId,
        title,
        category: producer.category,
        prompt: `建立 ${title}。品牌：${brandName}。人物：${characterName}。配音：${voiceName}。流程：${template?.name ?? "未選擇"}。`,
        status: "待審核",
        createdAt: now
      };
      const renderJob: RenderJob = {
        id: renderJobId,
        project: title,
        title,
        provider: producer.provider,
        createdAt: now,
        updatedAt: now,
        status: "等待中",
        prompt: draft.prompt,
        productionPackage: {
          workflowTemplateId: template?.id ?? null,
          workflowTemplateName: template?.name ?? null,
          status: "待審核"
        },
        character: { id: producer.characterId, name: characterName },
        brand: { id: producer.brandId, name: brandName },
        voice: { id: producer.voiceId, name: voiceName },
        request: {
          reviewStatus: "待審核",
          provider: producer.provider,
          workflowNodes: (template?.nodes ?? nodes).filter((node) => node.enabled).map((node) => node.label)
        },
        response: null,
        error: "",
        statusHistory: [
          { status: "等待中", at: now, note: "AI 製作人已建立待審核生成草稿。" }
        ]
      };

      projects.unshift(project);
      drafts.unshift(draft);
      queue.unshift(renderJob);

      return { id: crypto.randomUUID(), dateLabel, title, category: producer.category, status, projectId, renderJobId };
    });
    const nextPlan = [...createdPlan, ...weeklyPlan];

    window.localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
    window.localStorage.setItem(DIRECTOR_DRAFT_KEY, JSON.stringify(drafts));
    writeRenderQueue(queue);
    setWeeklyPlan(nextPlan);
    window.localStorage.setItem(WEEKLY_PLAN_KEY, JSON.stringify(nextPlan));
    setMessage(`已建立 ${createdPlan.length} 筆本週創作計畫，全部維持待審核。`);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">流程編排</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-normal">流程編排與 AI 製作人</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              建立可重用流程模板，再批次準備待審核的創作計畫與生成草稿。
            </p>
          </div>
          <Badge variant="secondary" className="w-fit">本機資料</Badge>
        </div>

        {message ? (
          <p className="rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground">{message}</p>
        ) : null}

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle>流程畫布</CardTitle>
                <CardDescription>拖曳節點或用上下按鈕調整流程順序。</CardDescription>
              </div>
              <Button onClick={saveTemplate}>儲存流程模板</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="模板名稱" value={templateName} onChange={setTemplateName} />
              <Select
                label="載入模板"
                value={selectedTemplateId}
                placeholder="選擇已儲存模板"
                options={templates.map((item) => ({ label: item.name, value: item.id }))}
                onChange={loadTemplate}
              />
            </div>
            <div className="space-y-3">
              {nodes.map((node, index) => (
                <div
                  key={node.id}
                  draggable
                  onDragStart={() => setDragIndex(index)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => {
                    if (dragIndex !== null) {
                      setNodes((current) => move(current, dragIndex, index));
                    }
                    setDragIndex(null);
                  }}
                  className="grid gap-3 rounded-md border bg-background p-3 md:grid-cols-[32px_minmax(0,1fr)_120px_160px_160px]"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-md border bg-secondary text-sm font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{node.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {node.enabled ? "已啟用" : "已停用"} · {node.requiresApproval ? "需要人工確認" : "可直接進下一步"}
                    </p>
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={node.enabled} onChange={(event) => updateNode(node.id, { enabled: event.target.checked })} />
                    啟用
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={node.requiresApproval} onChange={(event) => updateNode(node.id, { requiresApproval: event.target.checked })} />
                    人工確認
                  </label>
                  <div className="flex gap-2">
                    <select
                      className="h-9 min-w-0 flex-1 rounded-md border bg-background px-2 text-sm"
                      value={node.defaultProvider}
                      onChange={(event) => updateNode(node.id, { defaultProvider: event.target.value })}
                    >
                      {providers.map((item) => <option key={item} value={item}>{item}</option>)}
                    </select>
                    <Button size="sm" variant="outline" onClick={() => setNodes((current) => move(current, index, index - 1))}>上</Button>
                    <Button size="sm" variant="outline" onClick={() => setNodes((current) => move(current, index, index + 1))}>下</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI 製作人</CardTitle>
            <CardDescription>建立內容計畫，先產生待審核草稿，不自動生成影片。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <Select label="內容計畫" value={producer.cadence} placeholder="選擇計畫" options={["每天 3 支短影音", "每週 2 支長影片"].map((item) => ({ label: item, value: item }))} onChange={(value) => setProducer({ ...producer, cadence: value })} />
              <Select label="內容分類" value={producer.category} placeholder="選擇分類" options={categories.map((item) => ({ label: item, value: item }))} onChange={(value) => setProducer({ ...producer, category: value })} />
              <Select label="品牌" value={producer.brandId} placeholder="可留白" options={brands.map((item) => ({ label: titleOf(item), value: item.id }))} onChange={(value) => setProducer({ ...producer, brandId: value })} />
              <Select label="人物模板" value={producer.characterId} placeholder="可留白" options={characters.map((item) => ({ label: titleOf(item), value: item.id }))} onChange={(value) => setProducer({ ...producer, characterId: value })} />
              <Select label="配音" value={producer.voiceId} placeholder="可留白" options={voices.map((item) => ({ label: titleOf(item), value: item.id }))} onChange={(value) => setProducer({ ...producer, voiceId: value })} />
              <Select label="流程模板" value={producer.workflowTemplateId} placeholder="使用目前畫布" options={templates.map((item) => ({ label: item.name, value: item.id }))} onChange={(value) => setProducer({ ...producer, workflowTemplateId: value })} />
              <Select label="影片服務" value={producer.provider} placeholder="選擇影片服務" options={providers.map((item) => ({ label: item, value: item }))} onChange={(value) => setProducer({ ...producer, provider: value })} />
            </div>
            <Button onClick={createWeeklyPlan}>建立本週創作計畫</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>本週創作計畫</CardTitle>
            <CardDescription>AI 製作人建立的待審核計畫。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {weeklyPlan.length === 0 ? (
              <p className="rounded-md border bg-background p-3 text-sm text-muted-foreground">尚未建立本週創作計畫。</p>
            ) : (
              weeklyPlan.slice(0, 12).map((item) => (
                <div key={item.id} className="flex flex-col gap-2 rounded-md border bg-background p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium">{item.dateLabel}</p>
                    <p className="text-muted-foreground">{item.title}</p>
                  </div>
                  <Badge variant="outline">{item.status}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>

      <aside className="space-y-4">
        <Card className="xl:sticky xl:top-24">
          <CardHeader>
            <CardTitle>流程摘要</CardTitle>
            <CardDescription>{templates.length} 個已儲存模板</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <SummaryRow label="節點" value={`${enabledCount} / ${nodes.length} 啟用`} />
            <SummaryRow label="人工確認" value={`${approvalCount} 個節點`} />
            <SummaryRow label="本週產量" value={`${planCount} 筆草稿`} />
            <SummaryRow label="影片服務" value={producer.provider} />
            <div className="rounded-md border bg-secondary/30 p-3 text-sm text-muted-foreground">
              這版只建立專案、AI 導演草稿、生成佇列草稿，所有項目保持待審核。
            </div>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
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

function Select({
  label,
  value,
  options,
  placeholder,
  onChange
}: {
  label: string;
  value: string;
  options: Array<{ label: string; value: string }>;
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
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
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
