import { HubStubPage } from "@/components/Hub/HubStubPage";
export default function Page() {
  return <HubStubPage title="live now" description="streams currently live" icon="●" cta={{ href: "/hub", label: "Back to feed", testid: "live-cta" }} />;
}
