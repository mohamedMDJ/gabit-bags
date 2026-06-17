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
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          quantity,
          price,
          products (
            name
          )
        )
      `)
      .order("id", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    setOrders(data || []);
  }

  return (
    <main className="min-h-screen bg-[#f7f1e8] p-6">
      <header className="max-w-7xl mx-auto mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img
            src="/logo-gabit.jpg"
            alt="GABIT"
            className="h-16 w-16 rounded-full object-cover"
          />

          <h1 className="text-4xl font-black text-[#4db8df]">
            Commandes
          </h1>
        </div>

        <Link
          href="/admin"
          className="rounded-full bg-black text-white px-5 py-3"
        >
          Retour
        </Link>
      </header>

      <div className="max-w-7xl mx-auto space-y-6">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-[2rem] p-6 shadow-xl"
          >
            <div className="flex justify-between items-center">
              <h2 className="font-black text-3xl">
                Commande #{order.id}
              </h2>

              <span className="font-black text-2xl text-[#4db8df]">
                {order.total} DA
              </span>
            </div>

            <div className="mt-4 text-lg">
              <p>
                {order.first_name} {order.last_name}
              </p>

              <p>{order.phone}</p>

              <p>
                {order.wilaya} - {order.city}
              </p>

              <p>{order.delivery_type}</p>
            </div>

            <div className="mt-5 border-t pt-4">
              <h3 className="font-bold text-[#4db8df] text-xl">
                Produits commandés
              </h3>

              {order.order_items?.map(
                (item: any, index: number) => (
                  <div
                    key={index}
                    className="flex justify-between mt-2"
                  >
                    <span>
                      {item.products?.name} × {item.quantity}
                    </span>

                    <span>
                      {item.price * item.quantity} DA
                    </span>
                  </div>
                )
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}