import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { HubStubPage } from "@/components/Hub/HubStubPage";

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/signin?callback=/hub/admin");
  if (user.role !== "ADMIN") redirect("/hub");

  return (
    <HubStubPage
      title="admin console"
      description="moderate posts, users, boards"
      icon="◇"
      cta={{ href: "/hub", label: "Back to feed", testid: "admin-cta" }}
    />
  );
}
