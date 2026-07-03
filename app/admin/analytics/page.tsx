import AnalyticsDashboard from "@/components/AnalyticsDashboard";

export const metadata = {
  title: "SEO Analytics Dashboard | SwapSpot",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminAnalyticsPage() {
  return <AnalyticsDashboard />;
}
