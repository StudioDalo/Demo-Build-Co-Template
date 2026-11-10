import { redirect } from "next/navigation";
import { adminConfigured, isAdmin } from "@/lib/admin/auth";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <h1 className="text-2xl font-extrabold">Leads dashboard</h1>
        {adminConfigured() ? (
          <LoginForm />
        ) : (
          <p className="mt-4 text-muted" data-testid="admin-not-configured">Set a strong <code>ADMIN_PASSWORD</code> environment variable in Vercel (12+ characters, not a common or example password) to enable the dashboard.</p>
        )}
      </div>
    </main>
  );
}
