"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

export default function InStockFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.checked) params.set("inStock", "true");
    else params.delete("inStock");
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
      <input
        type="checkbox"
        checked={searchParams.get("inStock") === "true"}
        onChange={handleChange}
        className="rounded border-gray-300 text-primary-600"
      />
      In Stock Only
    </label>
  );
}
