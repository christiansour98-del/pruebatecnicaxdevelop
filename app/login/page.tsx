"use client";
import { TextField, Button, Alert, Box } from "@mui/material";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/authStore";

type User = { email: string; password: string };

export default function Login() {
  const router = useRouter();
  const [user, setUser] = useState<User>({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);

  async function handleSubmit() {
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    });

    if (res.ok) {
      const data = await res.json();
      setAuth(data.user.role, data.user.email);
      router.push("/posts");
    } else {
      const data = await res.json();
      setError(data.error || "Invalid credentials");
    }

    setLoading(false);
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          width: "50vw",
          marginLeft: "25vw",
          marginTop: "20vh",
        }}
      >
        {error && <Alert severity="error">{error}</Alert>}
        <h2> Login </h2>
        <TextField
          label="Email"
          placeholder="email"
          value={user.email}
          onChange={(e) =>
            setUser((prev) => ({ ...prev, email: e.target.value }))
          }
        />

        <TextField
          label="Password"
          placeholder="password"
          type="password"
          value={user.password}
          onChange={(e) =>
            setUser((prev) => ({ ...prev, password: e.target.value }))
          }
        />

        <Button
          variant="outlined"
          onClick={handleSubmit}
          disabled={loading || !user.email || !user.password}
        >
          {loading ? "Logging in..." : "Enviar"}
        </Button>
      </Box>
    </div>
  );
}
