import { HubStubPage } from "@/components/Hub/HubStubPage";
export default function Page() {
  return <HubStubPage title="saved" description="posts you've saved" icon="◷" cta={{ href: "/hub", label: "Find posts to save", testid: "saved-cta" }} />;
}
