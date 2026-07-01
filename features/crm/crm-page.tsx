import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

const summaryCards = [
  {
    title: "Active Leads",
    value: "12",
    detail: "Prospects with open insurance conversations."
  },
  {
    title: "Follow-ups Due",
    value: "5",
    detail: "Customer touchpoints that need attention today."
  },
  {
    title: "Appointments",
    value: "4",
    detail: "Scheduled meetings and review calls this week."
  },
  {
    title: "Closed Deals",
    value: "3",
    detail: "Recently completed customer decisions."
  }
];

const customers = [
  {
    name: "Emily Chen",
    need: "Family protection review",
    stage: "Follow-up",
    nextFollowUpDate: "2026-07-03",
    nextAction: "Send a simple policy comparison before Friday."
  },
  {
    name: "Daniel Wu",
    need: "Retirement income planning",
    stage: "Appointment",
    nextFollowUpDate: "2026-07-05",
    nextAction: "Prepare three questions for the planning call."
  },
  {
    name: "Grace Lin",
    need: "Medical and cancer coverage",
    stage: "Lead",
    nextFollowUpDate: "2026-07-08",
    nextAction: "Confirm current coverage gaps and family budget."
  }
];

const assistantSuggestions = [
  "Start with customers whose follow-up date is today.",
  "Prepare one clear next action before each appointment.",
  "Move closed conversations out of the active follow-up list."
];

export function CrmPage() {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <section className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">CRM</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-normal">
              Customer follow-ups and next actions
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              A static CRM workspace for reviewing placeholder customers before
              backend persistence or integrations are added.
            </p>
          </div>
          <Badge variant="secondary" className="w-fit">
            Placeholder data
          </Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <Card key={card.title} className="min-h-40">
              <CardHeader>
                <CardTitle>{card.title}</CardTitle>
                <CardDescription>{card.detail}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold">{card.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold">Customer list</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Placeholder customer cards for daily follow-up planning.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {customers.map((customer) => (
              <Card key={customer.name}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <CardTitle>{customer.name}</CardTitle>
                      <CardDescription>{customer.need}</CardDescription>
                    </div>
                    <Badge variant="outline">{customer.stage}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  <dl className="space-y-3 text-sm">
                    <div>
                      <dt className="text-muted-foreground">Next follow-up date</dt>
                      <dd className="mt-1 font-medium">{customer.nextFollowUpDate}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Next action</dt>
                      <dd className="mt-1 font-medium leading-6">{customer.nextAction}</dd>
                    </div>
                  </dl>

                  <div className="grid grid-cols-3 gap-2">
                    <Button variant="secondary" size="sm">
                      Complete
                    </Button>
                    <Button variant="outline" size="sm">
                      Delay
                    </Button>
                    <Button size="sm">Closed</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <aside className="space-y-4">
        <Card className="xl:sticky xl:top-24">
          <CardHeader>
            <CardTitle>CRM Assistant</CardTitle>
            <CardDescription>
              Placeholder suggestions for customer follow-up planning.
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
    </div>
  );
}
