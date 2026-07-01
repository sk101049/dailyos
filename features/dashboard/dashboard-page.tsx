import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

const dashboardCards = [
  {
    title: "Today's Tasks",
    value: "6 open",
    detail: "Prioritize follow-ups, prep work, and content tasks.",
    status: "Focus"
  },
  {
    title: "Video Pipeline",
    value: "2 drafts",
    detail: "One education topic is ready to record today.",
    status: "Content"
  },
  {
    title: "Customer Follow-ups",
    value: "3 customers",
    detail: "Check recent policy questions and renewal timing.",
    status: "CRM"
  },
  {
    title: "Appointments",
    value: "4 scheduled",
    detail: "Review tomorrow's meetings before the end of day.",
    status: "Calendar"
  },
  {
    title: "Sales Progress",
    value: "68%",
    detail: "Track active opportunities and next relationship steps.",
    status: "Pipeline"
  }
];

const suggestions = [
  "Follow up with 3 customers.",
  "Record one insurance education video.",
  "Prepare tomorrow's appointments."
];

export function DashboardPage() {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <section className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Sprint 1</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-normal">
              Today's priorities
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              A placeholder dashboard for reviewing daily insurance work before
              backend data and AI automation are added.
            </p>
          </div>
          <Badge variant="secondary" className="w-fit">
            Placeholder data
          </Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {dashboardCards.map((card) => (
            <Card key={card.title} className="min-h-44">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <CardTitle>{card.title}</CardTitle>
                    <CardDescription>{card.detail}</CardDescription>
                  </div>
                  <Badge variant="outline">{card.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold">{card.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <aside className="space-y-4">
        <Card className="xl:sticky xl:top-24">
          <CardHeader>
            <CardTitle>AI Assistant</CardTitle>
            <CardDescription>
              Placeholder suggestions for planning the day.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {suggestions.map((suggestion) => (
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
    </div>
  );
}
