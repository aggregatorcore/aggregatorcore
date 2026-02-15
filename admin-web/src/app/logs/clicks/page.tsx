"use client";

import { useEffect, useState } from "react";
import Protected from "@/components/Protected";
import { apiGet } from "@/lib/api";

type Click = {
  id: string;
  user_id: string;
  lender_id: string;
  utm_code: string;
  created_at?: string;
};

export default function ClicksPage() {
  const [clicks, setClicks] = useState<Click[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiGet<Click[]>("/admin/clicks")
      .then(setClicks)
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Protected>
      <div>
        <h1 className="text-2xl font-semibold mb-6">Click Logs</h1>
        {error && <p className="text-red-600 mb-4">{error}</p>}
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="bg-white rounded shadow overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-3">ID</th>
                  <th className="text-left p-3">User ID</th>
                  <th className="text-left p-3">Lender ID</th>
                  <th className="text-left p-3">UTM Code</th>
                  <th className="text-left p-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {clicks.map((c) => (
                  <tr key={c.id} className="border-t">
                    <td className="p-3 font-mono text-sm">{c.id.slice(0, 8)}...</td>
                    <td className="p-3 font-mono text-sm">{c.user_id?.slice(0, 8)}...</td>
                    <td className="p-3 font-mono text-sm">{c.lender_id?.slice(0, 8)}...</td>
                    <td className="p-3 font-mono text-sm">{c.utm_code}</td>
                    <td className="p-3 text-sm">{c.created_at ? new Date(c.created_at).toLocaleString() : "-"}</td>
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
