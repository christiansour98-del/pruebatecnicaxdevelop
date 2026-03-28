"use client";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/authStore";

export default function LogoutButton() {
  const router = useRouter();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const role = useAuthStore((state) => state.role);

  // only show if logged in
  if (!role) return null;

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    clearAuth();
    router.push("/login");
  }

  return (
    <button
      onClick={handleLogout}
      style={{
        position: "fixed",
        top: 16,
        right: 16,
        padding: "8px 16px",
        cursor: "pointer",
        zIndex: 100,
      }}
    >
      Logout
    </button>
  );
}
