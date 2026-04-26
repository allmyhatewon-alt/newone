import { HubStubPage } from "@/components/Hub/HubStubPage";
export default function Page() {
  return <HubStubPage title="discover" description="find new creators and posts" icon="◊" cta={{ href: "/hub", label: "Browse the feed", testid: "discover-cta" }} />;
}
