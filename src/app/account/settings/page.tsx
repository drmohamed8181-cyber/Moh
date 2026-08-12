import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { safeDb } from "@/lib/prisma";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AccountSettingsForm from "@/components/account/AccountSettingsForm";

export default async function SettingsPage() {
  const session = await auth().catch(() => null);
  if (!session?.user) redirect("/login");
  const userId = session.user.id;

  const user = await safeDb((db) => db.user.findUnique({ where: { id: userId } }));
  if (!user) redirect("/login");

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-10">
        <div className="container mx-auto px-4 max-w-2xl">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Account Settings</h1>
          <AccountSettingsForm initialName={user.name ?? ""} initialPhone={user.phone ?? ""} />
        </div>
      </main>
      <Footer />
    </>
  );
}
