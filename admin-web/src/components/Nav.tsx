"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/auth";

export default function Nav() {
  const path = usePathname();

  const links = [
    { href: "/lenders", label: "Lenders" },
    { href: "/logs/clicks", label: "Click Logs" },
    { href: "/users", label: "Users" },
  ];

  async function handleLogout() {
    await logout();
    window.location.href = "/login";
  }

  return (
    <nav className="bg-white border-b px-6 py-3 flex items-center gap-6">
      <Link href="/lenders" className="font-semibold text-lg">
        Loan Aggregator Admin
      </Link>
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={path === l.href ? "text-blue-600 font-medium" : "text-gray-600 hover:text-gray-900"}
        >
          {l.label}
        </Link>
      ))}
      <button
        onClick={handleLogout}
        className="ml-auto text-sm text-gray-500 hover:text-gray-700"
      >
        Logout
      </button>
    </nav>
  );
}
