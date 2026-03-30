import { createClient } from "@/lib/supabase/server";
import DataTable from "@/components/admin/DataTable";

export default async function AdminHelpers() {
  const supabase = await createClient();
  const { data: helpers, error } = await supabase
    .from("helpers")
    .select("id, full_name, email, services_count, rating, bg_check_status, created_at")
    .order("created_at", { ascending: false });

  const columns = [
    { key: "full_name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "services_count", label: "Services" },
    {
      key: "rating",
      label: "Rating",
      render: (value: unknown) =>
        value ? `${Number(value).toFixed(1)} ★` : "—",
    },
    {
      key: "bg_check_status",
      label: "Background Check",
      render: (value: unknown) => {
        const status = String(value ?? "pending");
        const colors: Record<string, string> = {
          passed: "bg-green-100 text-green-700",
          failed: "bg-red-100 text-red-700",
          pending: "bg-yellow-100 text-yellow-700",
        };
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] ?? colors.pending}`}
          >
            {status}
          </span>
        );
      },
    },
    {
      key: "created_at",
      label: "Joined",
      render: (value: unknown) =>
        value ? new Date(String(value)).toLocaleDateString() : "—",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Helpers</h1>
      {error ? (
        <p className="text-red-500">Error loading helpers: {error.message}</p>
      ) : (
        <DataTable
          columns={columns}
          data={(helpers as Record<string, unknown>[]) ?? []}
          searchKey="full_name"
          searchPlaceholder="Search by name..."
        />
      )}
    </div>
  );
}
