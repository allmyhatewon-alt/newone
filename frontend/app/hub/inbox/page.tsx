import { HubStubPage } from "@/components/Hub/HubStubPage";
export default function Page() {
  return <HubStubPage title="inbox" description="messages, mentions, replies" icon="✉" cta={{ href: "/hub", label: "Back to feed", testid: "inbox-cta" }} />;
}
