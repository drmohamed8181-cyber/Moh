import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { safeDb } from "@/lib/prisma";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AddressList from "@/components/account/AddressList";

export default async function AddressesPage() {
  const session = await auth().catch(() => null);
  if (!session?.user) redirect("/login");
  const userId = session.user.id;

  const addresses = await safeDb((db) => db.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }],
  })) ?? [];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-10">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">My Addresses</h1>
          <AddressList initialAddresses={addresses} />
        </div>
      </main>
      <Footer />
    </>
  );
}
