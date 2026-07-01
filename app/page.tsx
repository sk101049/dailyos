export default function Home() {
  return (
    <main className="min-h-screen bg-background px-6 py-16 text-foreground">
      <section className="mx-auto flex max-w-3xl flex-col gap-8">
        <div className="space-y-4">
          <p className="text-sm font-medium text-muted-foreground">DailyOS v0.1.0</p>
          <h1 className="text-4xl font-semibold tracking-normal sm:text-5xl">
            DailyOS
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
            A personal AI insurance workspace for starting each workday with
            focus, structure, and a clear next step.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border bg-card p-5 text-card-foreground">
            <h2 className="text-base font-semibold">Foundation</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Next.js, TypeScript, Tailwind CSS, and shadcn/ui configuration are
              ready for future product development.
            </p>
          </div>

          <div className="rounded-lg border bg-card p-5 text-card-foreground">
            <h2 className="text-base font-semibold">Next Sprint</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Plan and build the first Dashboard workflow after the foundation
              is merged.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
