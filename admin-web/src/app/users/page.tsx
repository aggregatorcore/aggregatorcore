"use client";

import { useEffect, useState } from "react";
import Protected from "@/components/Protected";
import { apiGet } from "@/lib/api";

type User = {
  id: string;
  firebase_uid: string;
  mobile_number: string | null;
  created_at?: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiGet<User[]>("/admin/users")
      .then(setUsers)
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Protected>
      <div>
        <h1 className="text-2xl font-semibold mb-6">Users</h1>
        {error && <p className="text-red-600 mb-4">{error}</p>}
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="bg-white rounded shadow overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-3">ID</th>
                  <th className="text-left p-3">Firebase UID</th>
                  <th className="text-left p-3">Mobile</th>
                  <th className="text-left p-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t">
                    <td className="p-3 font-mono text-sm">{u.id.slice(0, 8)}...</td>
                    <td className="p-3 font-mono text-sm">{u.firebase_uid}</td>
                    <td className="p-3">{u.mobile_number ?? "-"}</td>
                    <td className="p-3 text-sm">{u.created_at ? new Date(u.created_at).toLocaleString() : "-"}</td>
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
