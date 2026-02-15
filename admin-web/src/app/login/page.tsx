"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { checkSession, login } from "@/lib/auth";

export default function LoginPage() {
  const [password, setPasswordInput] = useState("");
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    checkSession().then((ok) => {
      setChecking(false);
      if (ok) router.replace("/lenders");
    });
  }, [mounted, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await login(password);
      router.push("/lenders");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid password");
    }
  }

  if (!mounted || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-80">
        <h1 className="text-xl font-semibold mb-4">Admin Login</h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPasswordInput(e.target.value)}
          placeholder="Password"
          className="w-full border rounded px-3 py-2 mb-4"
          required
        />
        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Login
        </button>
      </form>
    </div>
  );
}
