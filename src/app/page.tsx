export default function Home() {
  return (
    <div className="flex min-h-svh flex-1 bg-slate-50 text-slate-950">
      <main className="mx-auto flex w-full max-w-5xl flex-col justify-center gap-8 px-6 py-16">
        <div className="max-w-2xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-blue-700">
            North Down Softball Club
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            NDSC Council Area
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-700">
            A fresh Next.js workspace for council tools, with Prisma ready for
            database-backed features.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ["Next.js", "App Router, TypeScript, and Tailwind CSS are set up."],
            [
              "Prisma",
              "PostgreSQL datasource config and client helper are ready.",
            ],
            ["Next Steps", "Add models, connect a database, then run migrations."],
          ].map(([title, description]) => (
            <section
              key={title}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
              <h2 className="font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {description}
              </p>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
