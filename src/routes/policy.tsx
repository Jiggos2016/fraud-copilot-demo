import { createFileRoute } from "@tanstack/react-router";
import PolicySearch from "@/components/fraud/PolicySearch";
import { Shell } from "@/components/fraud/shared";

export const Route = createFileRoute("/policy")({
  validateSearch: (search: Record<string, unknown>) => ({
    search: typeof search["search"] === "string" ? search["search"] : undefined,
  }),
  component: PolicyPage,
  head: () => ({
    meta: [
      { title: "Policy Search — Fraud Copilot" },
      { name: "description", content: "Keyword search across the synthetic policy corpus with source and section attribution. Demo app with synthetic data." },
      { property: "og:title", content: "Policy Search — Fraud Copilot" },
      { property: "og:description", content: "Keyword search across the synthetic policy corpus with source attribution. Demo app with synthetic data." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function PolicyPage() {
  const { search } = Route.useSearch();
  return <Shell><PolicySearch key={search ?? ""} initialSearch={search ?? ""} /></Shell>;
}
