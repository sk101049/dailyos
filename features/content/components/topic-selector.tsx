import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { topics } from "../constants";

export function TopicSelector() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>主題選擇器</CardTitle>
        <CardDescription>
          選擇一個內容方向，作為下一支影片點子的框架。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {topics.map((topic) => (
            <Card key={topic.title} className="min-h-36 shadow-none">
              <CardHeader>
                <CardTitle>{topic.title}</CardTitle>
                <CardDescription>{topic.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
