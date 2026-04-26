import { HubStubPage } from "@/components/Hub/HubStubPage";
export default function Page() {
  return <HubStubPage title="admin console" description="moderate posts, users, boards" icon="◇" cta={{ href: "/hub", label: "Back to feed", testid: "admin-cta" }} />;
}
