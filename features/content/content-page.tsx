import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

const topics = [
  {
    title: "Retirement",
    description: "Turn retirement planning questions into short educational clips."
  },
  {
    title: "Medical",
    description: "Explain health coverage basics in plain language."
  },
  {
    title: "Cancer",
    description: "Prepare empathetic content around cancer protection planning."
  },
  {
    title: "Disability",
    description: "Create ideas about income protection and recovery planning."
  },
  {
    title: "Long-term Care",
    description: "Frame long-term care needs for families and caregivers."
  },
  {
    title: "Family Protection",
    description: "Help families understand risk, responsibility, and next steps."
  }
];

const workspaceSections = [
  {
    title: "Title",
    placeholder: "Example: 3 questions to ask before buying medical insurance"
  },
  {
    title: "Hook",
    placeholder: "Open with a relatable customer worry or common misconception."
  },
  {
    title: "Script",
    placeholder: "Outline the main teaching points for a 30-60 second video."
  },
  {
    title: "CTA",
    placeholder: "Invite viewers to review their policy or prepare questions."
  },
  {
    title: "Hashtags",
    placeholder: "#insurance #retirement #familyprotection"
  },
  {
    title: "Cover Text",
    placeholder: "A short cover line viewers can understand at a glance."
  }
];

const generatorControls = [
  {
    label: "Insurance topic",
    value: "Retirement",
    options: [
      "Retirement",
      "Medical",
      "Cancer",
      "Disability",
      "Long-term Care",
      "Family Protection"
    ]
  },
  {
    label: "Target audience",
    value: "Young families",
    options: ["Young families", "Working adults", "Business owners", "Retirees"]
  },
  {
    label: "Video length",
    value: "60 seconds",
    options: ["30 seconds", "60 seconds", "90 seconds"]
  },
  {
    label: "Tone",
    value: "Educational",
    options: ["Educational", "Warm", "Professional", "Urgent"]
  },
  {
    label: "Platform",
    value: "YouTube Shorts",
    options: ["YouTube Shorts", "TikTok", "Instagram Reels", "Facebook Reels"]
  }
];

const generatorPreviews = [
  {
    title: "Title",
    content: "Can your family keep the same lifestyle if income stops?"
  },
  {
    title: "Hook",
    content: "Most families plan for growth, but forget to plan for interruption."
  },
  {
    title: "Script",
    content:
      "Use this short placeholder script to explain one protection gap, one real-life example, and one simple next step."
  },
  {
    title: "CTA",
    content: "Review your current coverage before the next major family decision."
  },
  {
    title: "Hashtags",
    content: "#insurance #familyprotection #financialplanning"
  },
  {
    title: "Cover Text",
    content: "Protect the income your family depends on."
  }
];

const promptFields = [
  {
    label: "Goal",
    value: "Create a short educational insurance video script."
  },
  {
    label: "Audience",
    value: "Young families comparing protection options."
  },
  {
    label: "Key Message",
    value: "Insurance planning should protect daily life, not just future goals."
  },
  {
    label: "Constraints",
    value: "Keep the script under 60 seconds and avoid technical jargon."
  },
  {
    label: "Call to Action",
    value: "Invite viewers to review their current coverage."
  }
];

const promptPreview =
  "Create a short educational insurance video script for young families comparing protection options. Emphasize that insurance planning should protect daily life, not just future goals. Keep the script under 60 seconds, avoid technical jargon, and end by inviting viewers to review their current coverage.";

const assistantSuggestions = [
  "Pick one customer question and turn it into a 30-second answer.",
  "Start with one topic card, then fill the Hook before the full Script.",
  "Keep the CTA human: invite a conversation, not an automated action."
];

export function ContentPage() {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <section className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Content Studio</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-normal">
              Shape insurance ideas into short-form videos
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Use placeholder topic cards and script sections to plan video
              ideas before AI generation or backend storage is added.
            </p>
          </div>
          <Badge variant="secondary" className="w-fit">
            Static workspace
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Topic selector</CardTitle>
            <CardDescription>
              Choose an insurance theme to frame the next video idea.
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

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <CardTitle>AI Script Generator</CardTitle>
                <CardDescription>
                  Static controls for planning future AI-generated short-form
                  insurance scripts.
                </CardDescription>
              </div>
              <Badge variant="outline" className="w-fit">
                UI only
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              {generatorControls.map((control) => (
                <div
                  key={control.label}
                  className="rounded-lg border bg-background p-4"
                >
                  <p className="text-xs font-medium uppercase text-muted-foreground">
                    {control.label}
                  </p>
                  <p className="mt-2 text-sm font-semibold">{control.value}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {control.options.map((option) => (
                      <Badge
                        key={option}
                        variant={option === control.value ? "secondary" : "outline"}
                      >
                        {option}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <Button>Generate Script</Button>

            <div className="grid gap-4 lg:grid-cols-2">
              {generatorPreviews.map((preview) => (
                <Card key={preview.title} className="shadow-none">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle>{preview.title}</CardTitle>
                      <Badge variant="outline">Preview</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="min-h-24 rounded-md border bg-secondary/40 p-4 text-sm leading-6">
                      {preview.content}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <CardTitle>Prompt Builder</CardTitle>
                <CardDescription>
                  Static editable fields for shaping a future AI script prompt.
                </CardDescription>
              </div>
              <Button variant="outline">Copy Prompt</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 lg:grid-cols-2">
              {promptFields.map((field) => (
                <label key={field.label} className="space-y-2">
                  <span className="text-sm font-medium">{field.label}</span>
                  {field.label === "Constraints" || field.label === "Key Message" ? (
                    <textarea
                      className="min-h-28 w-full resize-none rounded-md border bg-background px-3 py-2 text-sm leading-6 outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                      defaultValue={field.value}
                    />
                  ) : (
                    <input
                      className="h-10 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                      defaultValue={field.value}
                    />
                  )}
                </label>
              ))}
            </div>

            <div className="rounded-lg border bg-secondary/40 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold">Prompt preview</p>
                <Badge variant="outline">Read-only</Badge>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {promptPreview}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Script workspace</CardTitle>
            <CardDescription>
              Placeholder sections for planning the video before real generation
              exists.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 lg:grid-cols-2">
              {workspaceSections.map((section) => (
                <Card key={section.title} className="shadow-none">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle>{section.title}</CardTitle>
                      <Badge variant="outline">Draft</Badge>
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
      </section>

      <aside className="space-y-4">
        <Card className="xl:sticky xl:top-24">
          <CardHeader>
            <CardTitle>Content Assistant</CardTitle>
            <CardDescription>
              Placeholder suggestions for planning video ideas.
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
