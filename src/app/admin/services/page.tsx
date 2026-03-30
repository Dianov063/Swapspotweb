"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface Service {
  id: string;
  name: string;
  subcategory: string;
  price: number;
  is_addon: boolean;
  is_active: boolean;
}

export default function AdminServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState("");

  const supabase = createClient();

  const fetchServices = useCallback(async () => {
    const { data, error: fetchError } = await supabase
      .from("service_catalog")
      .select("id, name, subcategory, price, is_addon, is_active")
      .order("name");

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setServices((data as Service[]) ?? []);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const toggleActive = async (id: string, current: boolean) => {
    await supabase
      .from("service_catalog")
      .update({ is_active: !current })
      .eq("id", id);
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, is_active: !current } : s))
    );
  };

  const savePrice = async (id: string) => {
    const price = parseFloat(editPrice);
    if (isNaN(price)) return;
    await supabase
      .from("service_catalog")
      .update({ price })
      .eq("id", id);
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, price } : s))
    );
    setEditingId(null);
  };

  const filtered = services.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Services</h1>
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Services</h1>

      {error ? (
        <p className="text-red-500">Error loading services: {error}</p>
      ) : (
        <>
          <div className="mb-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search services..."
              className="w-full max-w-sm px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest focus:border-transparent"
            />
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subcategory</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Add-on</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Active</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                      No services found
                    </td>
                  </tr>
                ) : (
                  filtered.map((service) => (
                    <tr key={service.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                        {service.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {service.subcategory || "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {editingId === service.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={editPrice}
                              onChange={(e) => setEditPrice(e.target.value)}
                              className="w-24 px-2 py-1 border rounded text-sm"
                              step="0.01"
                            />
                            <button
                              onClick={() => savePrice(service.id)}
                              className="text-green-600 text-xs font-medium"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="text-gray-400 text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <span
                            className="cursor-pointer hover:text-forest"
                            onClick={() => {
                              setEditingId(service.id);
                              setEditPrice(String(service.price));
                            }}
                          >
                            ${service.price.toFixed(2)}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {service.is_addon ? (
                          <span className="text-blue-600">Yes</span>
                        ) : (
                          <span className="text-gray-400">No</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() =>
                            toggleActive(service.id, service.is_active)
                          }
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            service.is_active ? "bg-forest" : "bg-gray-300"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              service.is_active
                                ? "translate-x-6"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
