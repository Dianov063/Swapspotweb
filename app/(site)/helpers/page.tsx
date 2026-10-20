import HelpersLandingPage, { helpersLandingMetadata } from "@/components/directory/HelpersLandingPage";

export function generateMetadata() {
  return helpersLandingMetadata("en");
}

export default function Page() {
  return <HelpersLandingPage locale="en" />;
}
