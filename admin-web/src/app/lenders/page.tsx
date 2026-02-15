"use client";

import { useEffect, useState } from "react";
import Protected from "@/components/Protected";
import { apiGet, apiPost, apiPut, apiPatch } from "@/lib/api";

type Lender = {
  id: string;
  name: string;
  is_active: boolean;
  min_income: number | null;
  min_loan: number | null;
  max_loan: number | null;
  supported_cities: string[] | null;
  employment_supported: string[] | null;
  affiliate_url: string | null;
};

export default function LendersPage() {
  const [lenders, setLenders] = useState<Lender[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Lender | null>(null);
  const [form, setForm] = useState({
    name: "",
    is_active: true,
    min_income: "",
    min_loan: "",
    max_loan: "",
    supported_cities: "",
    employment_supported: "",
    affiliate_url: "",
  });

  function load() {
    setLoading(true);
    apiGet<Lender[]>("/admin/lenders")
      .then(setLenders)
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  function resetForm() {
    setForm({
      name: "",
      is_active: true,
      min_income: "",
      min_loan: "",
      max_loan: "",
      supported_cities: "",
      employment_supported: "",
      affiliate_url: "",
    });
    setEditing(null);
    setShowForm(false);
  }

  function fillForm(l: Lender) {
    setForm({
      name: l.name,
      is_active: l.is_active,
      min_income: l.min_income?.toString() ?? "",
      min_loan: l.min_loan?.toString() ?? "",
      max_loan: l.max_loan?.toString() ?? "",
      supported_cities: Array.isArray(l.supported_cities) ? l.supported_cities.join(", ") : "",
      employment_supported: Array.isArray(l.employment_supported) ? l.employment_supported.join(", ") : "",
      affiliate_url: l.affiliate_url ?? "",
    });
    setEditing(l);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const payload = {
      name: form.name,
      is_active: form.is_active,
      min_income: form.min_income ? parseInt(form.min_income, 10) : null,
      min_loan: form.min_loan ? parseInt(form.min_loan, 10) : null,
      max_loan: form.max_loan ? parseInt(form.max_loan, 10) : null,
      supported_cities: form.supported_cities ? form.supported_cities.split(",").map((s) => s.trim()).filter(Boolean) : null,
      employment_supported: form.employment_supported ? form.employment_supported.split(",").map((s) => s.trim()).filter(Boolean) : null,
      affiliate_url: form.affiliate_url || null,
    };
    try {
      if (editing) {
        await apiPut(`/admin/lenders/${editing.id}`, payload);
      } else {
        await apiPost("/admin/lenders", payload);
      }
      resetForm();
      load();
    } catch (e) {
      setError(String(e));
    }
  }

  async function toggleActive(l: Lender) {
    try {
      await apiPatch(`/admin/lenders/${l.id}/toggle`);
      load();
    } catch (e) {
      setError(String(e));
    }
  }

  return (
    <Protected>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Lenders</h1>
          <button
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {showForm ? "Cancel" : "Add Lender"}
          </button>
        </div>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow mb-6 space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div className="flex gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Min Income</label>
                <input
                  type="number"
                  value={form.min_income}
                  onChange={(e) => setForm({ ...form, min_income: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Min Loan</label>
                <input
                  type="number"
                  value={form.min_loan}
                  onChange={(e) => setForm({ ...form, min_loan: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Max Loan</label>
                <input
                  type="number"
                  value={form.max_loan}
                  onChange={(e) => setForm({ ...form, max_loan: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Supported Cities (comma-separated)</label>
              <input
                value={form.supported_cities}
                onChange={(e) => setForm({ ...form, supported_cities: e.target.value })}
                placeholder="Mumbai, Delhi, Bangalore"
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Employment Supported (comma-separated)</label>
              <input
                value={form.employment_supported}
                onChange={(e) => setForm({ ...form, employment_supported: e.target.value })}
                placeholder="salaried, self_employed"
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Affiliate URL</label>
              <input
                value={form.affiliate_url}
                onChange={(e) => setForm({ ...form, affiliate_url: e.target.value })}
                placeholder="https://..."
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              />
              <label htmlFor="is_active">Active</label>
            </div>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              {editing ? "Update" : "Create"}
            </button>
          </form>
        )}

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="bg-white rounded shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Active</th>
                  <th className="text-left p-3">Min Income</th>
                  <th className="text-left p-3">Loan Range</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {lenders.map((l) => (
                  <tr key={l.id} className="border-t">
                    <td className="p-3">{l.name}</td>
                    <td className="p-3">{l.is_active ? "Yes" : "No"}</td>
                    <td className="p-3">{l.min_income ?? "-"}</td>
                    <td className="p-3">
                      {l.min_loan ?? 0} - {l.max_loan ?? "-"}
                    </td>
                    <td className="p-3 flex gap-2">
                      <button
                        onClick={() => toggleActive(l)}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Toggle
                      </button>
                      <button onClick={() => fillForm(l)} className="text-sm text-blue-600 hover:underline">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Protected>
  );
}
