import { redirect } from "next/navigation";

export default function DashboardPropertyPage({ params }: { params: { id: string } }) {
  redirect(`/dashboard/${params.id}/edit`);
}
