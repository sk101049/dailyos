import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { messages } from "@/messages/zh-TW";
import { workspaceSections } from "../constants";

export function ScriptWorkspace() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>腳本工作區</CardTitle>
        <CardDescription>
          在真正產生腳本前，先用示範區塊規劃影片內容。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 lg:grid-cols-2">
          {workspaceSections.map((section) => (
            <Card key={section.title} className="shadow-none">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <CardTitle>{section.title}</CardTitle>
                  <Badge variant="outline">{messages.common.draft}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="min-h-24 rounded-md border border-dashed bg-muted/40 p-4 text-sm leading-6 text-muted-foreground">
                  {section.placeholder}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
