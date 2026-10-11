import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/authOptions";
import { WhatsAppConnection } from "@/components/dashboard/WhatsAppConnection";

export default async function WhatsAppPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  if (session.user.role !== "admin") redirect("/dashboard");
  return <WhatsAppConnection />;
}
