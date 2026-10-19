import ServicesDirectoryPage, { servicesDirectoryMetadata } from "@/components/directory/ServicesDirectoryPage";

export const dynamic = "force-dynamic";

export const metadata = servicesDirectoryMetadata("en");

export default function Page() {
  return <ServicesDirectoryPage locale="en" />;
}
