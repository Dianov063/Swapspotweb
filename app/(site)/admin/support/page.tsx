import AdminConsole from "@/components/AdminConsole";

export const metadata = {
  title: "Support Inbox | SwapSpot",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminSupportPage() {
  return <AdminConsole initialTab="support" />;
}
