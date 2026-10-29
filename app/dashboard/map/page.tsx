import type { Metadata } from "next";
import AdminMapExplorerClient from "./AdminMapExplorerClient";

export const metadata: Metadata = {
  title: "Laâyoune Map Explorer | DreamX Real Estate Admin",
  description: "Production admin map tool for browsing properties, neighborhoods, and inventory in Laâyoune.",
  robots: { index: false, follow: false },
};

export default function AdminMapPage() {
  return <AdminMapExplorerClient />;
}
