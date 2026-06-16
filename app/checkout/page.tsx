"use client";

import { useEffect, useState } from "react";
import emailjs from "@emailjs/browser";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type CartItem = {
  id: number;
  name: string;
  price: number;
  stock: number;
  quantity: number;
};

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [wilaya, setWilaya] = useState("");
  const [city, setCity] = useState("");
  const [delivery, setDelivery] = useState("domicile");

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(savedCart);
  }, []);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  async function confirmOrder() {
    if (!firstName || !lastName || !phone || !wilaya || !city) {
      alert("Remplis tous les champs.");
      return;
    }

    if (cart.length === 0) {
      alert("Le panier est vide.");
      return;
    }

    setLoading(true);

    try {
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          first_name: firstName,
          last_name: lastName,
          phone,
          wilaya,
          city,
          delivery_type: delivery,
          total,
        })
        .select()
        .single();

      if (orderError) {
        alert("Erreur commande : " + orderError.message);
        setLoading(false);
        return;
      }

      const orderItems = cart.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) {
        alert("Erreur articles : " + itemsError.message);
        setLoading(false);
        return;
      }

      for (const item of cart) {
        await supabase
          .from("products")
          .update({ stock: item.stock - item.quantity })
          .eq("id", item.id);
      }

      const productsText = cart
        .map((item) => `${item.name} x ${item.quantity} = ${item.price * item.quantity} DA`)
        .join("\n");

      await emailjs.send(
        "service_dbznmvp",
        "template_oelryqk",
        {
          order_id: order.id,
          name: `${lastName} ${firstName}`,
          phone,
          wilaya,
          city,
          delivery,
          products: productsText,
          total: `${total} DA`,
          email: "gabit.bags@gmail.com",
        },
        "TBjVOCiuNbBhJBWNy"
      );

      localStorage.removeItem("cart");
      setCart([]);

      alert("Commande confirmée avec succès !");
    } catch (error) {
      console.log("Erreur :", error);
      alert("Une erreur est arrivée. Regarde la console.");
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-[#f7f1e8] px-6 py-8 text-[#211815]">
      <header className="mx-auto max-w-6xl mb-8 rounded-[2rem] bg-white/70 p-6 shadow-xl border border-white">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-4">
            <img src="/logo-gabit.jpg" alt="GABIT" className="h-16 w-16 rounded-full object-cover shadow" />
            <div>
              <h1 className="text-3xl font-black text-[#4db8df]">Commande</h1>
              <p className="text-sm text-gray-600">Finaliser votre achat</p>
            </div>
          </Link>

          <Link href="/cart" className="rounded-full bg-[#211815] px-5 py-3 text-white font-semibold hover:bg-[#4db8df] transition">
            Panier
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 rounded-[2rem] bg-white p-6 shadow-xl border border-black/5">
          <h2 className="text-3xl font-black mb-6">Informations client</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="rounded-2xl border border-black/10 bg-[#f7f1e8] p-4" placeholder="Nom" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            <input className="rounded-2xl border border-black/10 bg-[#f7f1e8] p-4" placeholder="Prénom" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            <input className="rounded-2xl border border-black/10 bg-[#f7f1e8] p-4 md:col-span-2" placeholder="Téléphone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <input className="rounded-2xl border border-black/10 bg-[#f7f1e8] p-4" placeholder="Wilaya" value={wilaya} onChange={(e) => setWilaya(e.target.value)} />
            <input className="rounded-2xl border border-black/10 bg-[#f7f1e8] p-4" placeholder="Ville" value={city} onChange={(e) => setCity(e.target.value)} />
            <select className="rounded-2xl border border-black/10 bg-[#f7f1e8] p-4 md:col-span-2" value={delivery} onChange={(e) => setDelivery(e.target.value)}>
              <option value="domicile">Livraison à domicile</option>
              <option value="bureau">Livraison au bureau</option>
            </select>
          </div>

          <button
            onClick={confirmOrder}
            disabled={loading}
            className="mt-6 w-full rounded-full bg-[#4db8df] py-4 text-white font-black shadow-lg hover:scale-[1.02] transition disabled:bg-gray-300"
          >
            {loading ? "Enregistrement..." : "Confirmer la commande"}
          </button>
        </div>

        <aside className="rounded-[2rem] bg-white p-6 shadow-xl border border-black/5 h-fit">
          <h2 className="text-3xl font-black">Résumé</h2>

          <div className="mt-5 space-y-3">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between gap-4 text-sm">
                <span>{item.name} × {item.quantity}</span>
                <span className="font-bold">{item.price * item.quantity} DA</span>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t pt-4 flex justify-between text-2xl font-black">
            <span>Total</span>
            <span className="text-[#4db8df]">{total} DA</span>
          </div>
        </aside>
      </section>
    </main>
  );
}