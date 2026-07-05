"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

type Asset = { id: string; title?: string; name?: string };

type Brand = {
  id: string;
  name: string;
  logoFileName: string;
  primaryColor: string;
  subtitleStyle: string;
  introNote: string;
  outroCta: string;
  defaultCharacterId: string;
  defaultVoiceId: string;
  defaultVideoStyle: string;
  createdAt: string;
  updatedAt: string;
};

const BRAND_KEY = "dailyos-brand-library";
const CHARACTER_KEY = "dailyos-character-library";
const VOICE_KEY = "dailyos-voice-library";

const emptyBrand = {
  name: "",
  logoFileName: "",
  primaryColor: "#2563eb",
  subtitleStyle: "繁體中文大字幕，高對比，置中偏下",
  introNote: "開頭 2 秒帶出品牌與主題。",
  outroCta: "追蹤我們，學會更聰明地規劃生活。",
  defaultCharacterId: "",
  defaultVoiceId: "",
  defaultVideoStyle: "明亮、溫暖、可信任"
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

function labelOf(asset: Asset) {
  return asset.title ?? asset.name ?? asset.id;
}

export function BrandPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [characters, setCharacters] = useState<Asset[]>([]);
  const [voices, setVoices] = useState<Asset[]>([]);
  const [editingId, setEditingId] = useState("");
  const [form, setForm] = useState(emptyBrand);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setBrands(readArray<Brand>(BRAND_KEY));
    setCharacters(readArray<Asset>(CHARACTER_KEY));
    setVoices(readArray<Asset>(VOICE_KEY));
  }, []);

  function persist(next: Brand[]) {
    setBrands(next);
    window.localStorage.setItem(BRAND_KEY, JSON.stringify(next));
  }

  function saveBrand() {
    if (!form.name.trim()) {
      setMessage("請先輸入品牌名稱。");
      return;
    }

    const now = new Date().toISOString();
    const brand: Brand = {
      id: editingId || crypto.randomUUID(),
      ...form,
      name: form.name.trim(),
      createdAt: brands.find((item) => item.id === editingId)?.createdAt ?? now,
      updatedAt: now
    };
    persist(editingId ? brands.map((item) => item.id === editingId ? brand : item) : [brand, ...brands]);
    setEditingId(brand.id);
    setMessage("品牌已儲存。");
  }

  function editBrand(brand: Brand) {
    setEditingId(brand.id);
    setForm({
      name: brand.name,
      logoFileName: brand.logoFileName,
      primaryColor: brand.primaryColor,
      subtitleStyle: brand.subtitleStyle,
      introNote: brand.introNote,
      outroCta: brand.outroCta,
      defaultCharacterId: brand.defaultCharacterId,
      defaultVoiceId: brand.defaultVoiceId,
      defaultVideoStyle: brand.defaultVideoStyle
    });
    setMessage(null);
  }

  function deleteBrand(id: string) {
    persist(brands.filter((item) => item.id !== id));
    if (editingId === id) {
      setEditingId("");
      setForm(emptyBrand);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <section className="space-y-6">
        <div>
          <p className="text-sm font-medium text-primary">品牌工作室</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-normal">品牌一致性設定</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            建立品牌 Logo、字幕、片頭片尾與預設人物聲音。資料只存在本機。
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "編輯品牌" : "新增品牌"}</CardTitle>
            <CardDescription>Logo 目前只保存本機檔名，不上傳檔案。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {message ? <p className="rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground">{message}</p> : null}
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="品牌名稱" value={form.name} onChange={(value) => setForm({ ...form, name: value })} />
              <label className="space-y-2">
                <span className="text-sm font-medium">品牌 Logo</span>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  onChange={(event) => setForm({ ...form, logoFileName: event.target.files?.[0]?.name ?? "" })}
                />
                <span className="block text-xs text-muted-foreground">{form.logoFileName || "尚未選擇 Logo"}</span>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium">品牌主色</span>
                <input
                  type="color"
                  className="h-10 w-full rounded-md border bg-background px-2"
                  value={form.primaryColor}
                  onChange={(event) => setForm({ ...form, primaryColor: event.target.value })}
                />
              </label>
              <Field label="字幕樣式" value={form.subtitleStyle} onChange={(value) => setForm({ ...form, subtitleStyle: value })} />
              <Field label="片頭說明" value={form.introNote} onChange={(value) => setForm({ ...form, introNote: value })} />
              <Field label="片尾 CTA" value={form.outroCta} onChange={(value) => setForm({ ...form, outroCta: value })} />
              <Select label="預設人物模板" value={form.defaultCharacterId} onChange={(value) => setForm({ ...form, defaultCharacterId: value })} options={characters} />
              <Select label="預設配音" value={form.defaultVoiceId} onChange={(value) => setForm({ ...form, defaultVoiceId: value })} options={voices} />
              <Field label="預設影片風格" value={form.defaultVideoStyle} onChange={(value) => setForm({ ...form, defaultVideoStyle: value })} />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={saveBrand}>{editingId ? "儲存品牌" : "建立品牌"}</Button>
              <Button variant="outline" onClick={() => { setEditingId(""); setForm(emptyBrand); }}>清空表單</Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <aside className="space-y-4">
        <Card className="xl:sticky xl:top-24">
          <CardHeader>
            <CardTitle>品牌庫</CardTitle>
            <CardDescription>{brands.length} 個本機品牌</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {brands.length === 0 ? (
              <p className="rounded-md border bg-background p-3 text-sm text-muted-foreground">尚未建立品牌。</p>
            ) : brands.map((brand) => (
              <article key={brand.id} className="rounded-md border bg-background p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{brand.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{brand.defaultVideoStyle}</p>
                  </div>
                  <span className="h-6 w-6 rounded border" style={{ backgroundColor: brand.primaryColor }} />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" variant="secondary" onClick={() => editBrand(brand)}>編輯</Button>
                  <Button size="sm" variant="outline" onClick={() => deleteBrand(brand.id)}>刪除</Button>
                </div>
              </article>
            ))}
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
      <input className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: Asset[]; onChange: (value: string) => void }) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium">{label}</span>
      <select className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">未設定</option>
        {options.map((item) => <option key={item.id} value={item.id}>{labelOf(item)}</option>)}
      </select>
    </label>
  );
}
