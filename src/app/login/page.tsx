"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await signIn("credentials", { redirect: false, email, password });
    if (res?.error) { setError("Invalid credentials"); return; }
    router.push("/"); // or /jobs
  }

  return (
    <section className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-semibold">Log In</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <input className="w-full rounded-lg border px-4 py-2" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email" />
        <input className="w-full rounded-lg border px-4 py-2" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="password" />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="w-full rounded-lg bg-black px-4 py-2 text-white hover:bg-gray-900" type="submit">Continue</button>
      </form>
    </section>
  );
}
