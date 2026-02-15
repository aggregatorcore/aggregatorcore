"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { checkSession } from "@/lib/auth";
import Nav from "./Nav";

export default function Protected({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    checkSession().then((ok) => {
      setAuthorized(ok);
      if (!ok) router.replace("/login");
    });
  }, [router]);

  if (authorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Redirecting to login...</p>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return (
    <>
      <Nav />
      <main className="p-6">{children}</main>
    </>
  );
}
