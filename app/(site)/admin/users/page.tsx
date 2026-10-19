import AdminConsole from "@/components/AdminConsole";

export const metadata = {
  title: "User Directory | SwapSpot",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminUsersPage() {
  return <AdminConsole initialTab="users" />;
}
