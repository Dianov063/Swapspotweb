import { createClient } from "@/lib/supabase/server";
import DataTable from "@/components/admin/DataTable";

export default async function AdminUsers() {
  const supabase = await createClient();
  const { data: users, error } = await supabase
    .from("users")
    .select("id, full_name, email, role, is_pro, created_at")
    .order("created_at", { ascending: false });

  const columns = [
    { key: "full_name", label: "Name" },
    { key: "email", label: "Email" },
    {
      key: "role",
      label: "Role",
      render: (value: unknown) => {
        const role = String(value ?? "client");
        const colors: Record<string, string> = {
          helper: "bg-blue-100 text-blue-700",
          client: "bg-gray-100 text-gray-700",
          admin: "bg-purple-100 text-purple-700",
        };
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${colors[role] ?? colors.client}`}
          >
            {role}
          </span>
        );
      },
    },
    {
      key: "is_pro",
      label: "Pro",
      render: (value: unknown) =>
        value ? (
          <span className="text-green-600 font-medium">Yes</span>
        ) : (
          <span className="text-gray-400">No</span>
        ),
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
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Users</h1>
      {error ? (
        <p className="text-red-500">Error loading users: {error.message}</p>
      ) : (
        <DataTable
          columns={columns}
          data={(users as Record<string, unknown>[]) ?? []}
          searchKey="full_name"
          searchPlaceholder="Search by name..."
        />
      )}
    </div>
  );
}
