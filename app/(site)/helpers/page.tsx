import HelpersLandingPage, { helpersLandingMetadata } from "@/components/directory/HelpersLandingPage";

export const metadata = helpersLandingMetadata("en");

export default function Page() {
  return <HelpersLandingPage locale="en" />;
}
