"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ISSUE_REPORT_KEY } from "@/lib/beta-validation";

type IssueReport = {
  id: string;
  page: string;
  note: string;
  createdAt: string;
};

function readReports(): IssueReport[] {
  try {
    const saved = window.localStorage.getItem(ISSUE_REPORT_KEY);
    const parsed = saved ? (JSON.parse(saved) as IssueReport[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function IssueReportButton({ page }: { page: string }) {
  const [message, setMessage] = useState("");

  function reportIssue() {
    const now = new Date().toISOString();
    const report: IssueReport = {
      id: crypto.randomUUID(),
      page,
      note: `${page} 使用流程需要檢查。`,
      createdAt: now
    };

    window.localStorage.setItem(ISSUE_REPORT_KEY, JSON.stringify([report, ...readReports()]));
    setMessage("已建立問題紀錄。");
  }

  return (
    <div className="flex items-center gap-2">
      {message ? <span className="text-xs text-muted-foreground">{message}</span> : null}
      <Button variant="outline" size="sm" onClick={reportIssue}>
        回報問題
      </Button>
    </div>
  );
}
