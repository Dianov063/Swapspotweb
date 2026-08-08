import UserDirectory from "@/components/UserDirectory";

export const metadata = {
  title: "User Directory | SwapSpot",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminUsersPage() {
  return <UserDirectory />;
}
