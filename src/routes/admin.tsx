import { createFileRoute } from "@tanstack/react-router";
import AdminView from "@/components/fraud/AdminView";
import { Shell } from "@/components/fraud/shared";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({
    meta: [
      { title: "Admin — Fraud Copilot" },
      { name: "description", content: "Read-only demo administration view with model metadata and fixed demo thresholds. Demo app with synthetic data." },
      { property: "og:title", content: "Admin — Fraud Copilot" },
      { property: "og:description", content: "Read-only demo administration view. Demo app with synthetic data." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function AdminPage() {
  return <Shell><AdminView /></Shell>;
}
