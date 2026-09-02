import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { safeDb } from "@/lib/prisma";
import WishlistList from "@/components/account/WishlistList";

export default async function WishlistPage() {
  const session = await auth().catch(() => null);
  if (!session?.user) redirect("/login");
  const userId = session.user.id;

  const items = await safeDb((db) => db.wishlistItem.findMany({
    where: { userId },
    include: { product: { select: { id: true, name: true, slug: true, images: true, isAvailable: true, category: { select: { name: true } } } } },
  })) ?? [];

  const products = items.map((i) => i.product);

  return (
    <div className="container mx-auto px-4 max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">My Wishlist</h1>
      <WishlistList items={products} />
    </div>
  );
}
