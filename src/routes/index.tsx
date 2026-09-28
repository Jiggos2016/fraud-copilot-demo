import { createFileRoute } from "@tanstack/react-router";
import RiskQueue from "@/components/fraud/RiskQueue";
import { Shell } from "@/components/fraud/shared";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Fraud Copilot — Risk Queue" },
      { name: "description", content: "Risk-ranked unemployment insurance claim queue for investigation triage. Demo app with synthetic data." },
      { property: "og:title", content: "Fraud Copilot — Risk Queue" },
      { property: "og:description", content: "Risk-ranked UI claim queue for investigation triage. Demo app with synthetic data." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function Index() {
  return <Shell><RiskQueue /></Shell>;
}
