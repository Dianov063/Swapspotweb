import { createClient } from "@/lib/supabase/server";
import DataTable from "@/components/admin/DataTable";

export default async function AdminBookings() {
  const supabase = await createClient();
  const { data: bookings, error } = await supabase
    .from("bookings")
    .select("id, client_name, helper_name, service, status, scheduled_at, created_at")
    .order("created_at", { ascending: false });

  const columns = [
    { key: "client_name", label: "Client" },
    { key: "helper_name", label: "Helper" },
    { key: "service", label: "Service" },
    {
      key: "status",
      label: "Status",
      render: (value: unknown) => {
        const status = String(value ?? "pending");
        const colors: Record<string, string> = {
          completed: "bg-green-100 text-green-700",
          pending: "bg-yellow-100 text-yellow-700",
          cancelled: "bg-red-100 text-red-700",
          in_progress: "bg-blue-100 text-blue-700",
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
      key: "scheduled_at",
      label: "Scheduled",
      render: (value: unknown) =>
        value ? new Date(String(value)).toLocaleString() : "—",
    },
    {
      key: "created_at",
      label: "Created",
      render: (value: unknown) =>
        value ? new Date(String(value)).toLocaleDateString() : "—",
    },
  ];

  const hasBookings = !error && bookings && bookings.length > 0;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Bookings</h1>
      {error ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
          <p className="text-4xl mb-4">📅</p>
          <p className="text-gray-500 text-lg">No bookings yet</p>
          <p className="text-gray-400 text-sm mt-2">
            Bookings will appear here once clients start booking services.
          </p>
        </div>
      ) : hasBookings ? (
        <DataTable
          columns={columns}
          data={(bookings as Record<string, unknown>[]) ?? []}
          searchKey="client_name"
          searchPlaceholder="Search by client..."
        />
      ) : (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
          <p className="text-4xl mb-4">📅</p>
          <p className="text-gray-500 text-lg">No bookings yet</p>
          <p className="text-gray-400 text-sm mt-2">
            Bookings will appear here once clients start booking services.
          </p>
        </div>
      )}
    </div>
  );
}
