"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    getOrders();
  }, []);

  async function getOrders() {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("id", { ascending: false });

    setOrders(data || []);
  }

  return (
    <main className="min-h-screen bg-[#f7f1e8] p-6">
      <header className="max-w-7xl mx-auto mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img
            src="/logo-gabit.jpg"
            alt="GABIT"
            className="h-16 w-16 rounded-full"
          />

          <div>
            <h1 className="text-4xl font-black text-[#4db8df]">
              Commandes
            </h1>
          </div>
        </div>

        <Link
          href="/admin"
          className="rounded-full bg-black text-white px-5 py-3"
        >
          Retour
        </Link>
      </header>

      <div className="max-w-7xl mx-auto space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-[2rem] p-6 shadow-xl">
            <div className="flex justify-between">
              <h2 className="font-black text-2xl">Commande #{order.id}</h2>

              <span className="font-bold text-[#4db8df]">
                {order.total} DA
              </span>
            </div>

            <div className="mt-4 text-gray-700">
              <p>
                {order.first_name} {order.last_name}
              </p>
              <p>{order.phone}</p>
              <p>
                {order.wilaya} - {order.city}
              </p>
              <p>{order.delivery_type}</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}