import DashboardClient from "./DashboardClient";
import { configuredPublicSiteOrigin } from "@/lib/site-url";
export default function DashboardPage() {
  return <DashboardClient publicOrigin={configuredPublicSiteOrigin()} />;
}
