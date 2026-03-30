import { createClient } from "@/lib/supabase/server";
import StatsCard from "@/components/admin/StatsCard";

async function getCount(tableName: string) {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from(tableName)
    .select("*", { count: "exact", head: true });
  if (error) return 0;
  return count ?? 0;
}

export default async function AdminDashboard() {
  const [helpers, users, services, bookings] = await Promise.all([
    getCount("helpers"),
    getCount("users"),
    getCount("service_catalog"),
    getCount("bookings"),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Total Helpers" value={helpers} icon="🛠️" />
        <StatsCard title="Total Users" value={users} icon="👥" />
        <StatsCard title="Active Services" value={services} icon="📋" />
        <StatsCard title="Total Bookings" value={bookings} icon="📅" />
      </div>
    </div>
  );
}
