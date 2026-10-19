import ServicesDirectoryPage, { servicesDirectoryMetadata } from "@/components/directory/ServicesDirectoryPage";

export const dynamic = "force-dynamic";

export function generateMetadata() {
  return servicesDirectoryMetadata("en");
}

export default function Page() {
  return <ServicesDirectoryPage locale="en" />;
}
