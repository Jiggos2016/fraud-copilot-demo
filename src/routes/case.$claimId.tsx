import { createFileRoute } from "@tanstack/react-router";
import CaseDetail from "@/components/fraud/CaseDetail";
import { Shell } from "@/components/fraud/shared";

export const Route = createFileRoute("/case/$claimId")({
  component: CasePage,
  head: () => ({
    meta: [
      { title: "Case Workspace — Fraud Copilot" },
      { name: "description", content: "Investigation workspace with signals, evidence, AI-drafted memo, grounded copilot, and human-only disposition. Demo app with synthetic data." },
      { property: "og:title", content: "Case Workspace — Fraud Copilot" },
      { property: "og:description", content: "Investigation workspace with signals, evidence, and grounded copilot. Demo app with synthetic data." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function CasePage() {
  const { claimId } = Route.useParams();
  return <Shell><CaseDetail key={claimId} claimId={claimId} /></Shell>;
}
