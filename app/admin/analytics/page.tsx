import AdminConsole from "@/components/AdminConsole";

export const metadata = {
  title: "SEO Analytics Dashboard | SwapSpot",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminAnalyticsPage() {
  return <AdminConsole initialTab="analytics" />;
}
