"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function AdminPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [ordersCount, setOrdersCount] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { data: productsData } = await supabase.from("products").select("*");

    const { count } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true });

    setProducts(productsData || []);
    setOrdersCount(count || 0);
  }

  return (
    <main className="min-h-screen bg-[#f7f1e8] p-6">
      <header className="max-w-7xl mx-auto rounded-[2rem] bg-white p-6 shadow-xl">
        <div className="flex items-center gap-4">
          <img
            src="/logo-gabit.jpg"
            alt="GABIT"
            className="h-20 w-20 rounded-full object-cover"
          />

          <div>
            <h1 className="text-5xl font-black text-[#4db8df]">
              Admin GABIT
            </h1>
            <p className="text-gray-600">Tableau de bord</p>
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto mt-8 grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-[2rem] p-6 shadow-xl">
          <h2 className="text-gray-500">Produits</h2>
          <p className="text-5xl font-black mt-3">{products.length}</p>
        </div>

        <div className="bg-white rounded-[2rem] p-6 shadow-xl">
          <h2 className="text-gray-500">Commandes</h2>
          <p className="text-5xl font-black mt-3">{ordersCount}</p>
        </div>

        <div className="bg-white rounded-[2rem] p-6 shadow-xl">
          <h2 className="text-gray-500">Boutique</h2>
          <Link
            href="/"
            className="inline-block mt-4 rounded-full bg-[#4db8df] px-6 py-3 text-white font-bold"
          >
            Ouvrir
          </Link>
        </div>
      </section>

      <section className="max-w-7xl mx-auto mt-8 grid md:grid-cols-2 gap-6">
        <Link
          href="/admin/orders"
          className="bg-white rounded-[2rem] p-8 shadow-xl hover:scale-[1.02] transition"
        >
          <h2 className="text-3xl font-black">Voir les commandes</h2>
        </Link>

        <Link
          href="/admin/products"
          className="bg-white rounded-[2rem] p-8 shadow-xl hover:scale-[1.02] transition"
        >
          <h2 className="text-3xl font-black">Gérer les produits</h2>
        </Link>
      </section>
    </main>
  );
}