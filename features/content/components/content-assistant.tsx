import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { messages } from "@/messages/zh-TW";
import { assistantSuggestions } from "../constants";

export function ContentAssistant() {
  return (
    <aside className="space-y-4">
      <Card className="xl:sticky xl:top-24">
        <CardHeader>
          <CardTitle>{messages.common.contentAssistant}</CardTitle>
          <CardDescription>
            用於規劃影片點子的示範建議。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {assistantSuggestions.map((suggestion) => (
              <li
                key={suggestion}
                className="rounded-md border bg-secondary/50 px-3 py-3 text-sm leading-6"
              >
                {suggestion}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </aside>
  );
}
