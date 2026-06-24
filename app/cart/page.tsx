"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type CartItem = {
  id: number;
  name: string;
  price: number;
  image: string;
  stock: number;
  quantity: number;
};

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(savedCart);
  }, []);

  function saveCart(newCart: CartItem[]) {
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  }

  function getImageSrc(image: string) {
    if (image.startsWith("http")) return image;
    return `/${image.trim()}`;
  }

  function increaseQuantity(id: number) {
    const newCart = cart.map((item) => {
      if (item.id === id && item.quantity < item.stock) {
        return { ...item, quantity: item.quantity + 1 };
      }

      return item;
    });

    saveCart(newCart);
  }

  function decreaseQuantity(id: number) {
    const newCart = cart
      .map((item) => {
        if (item.id === id) {
          return { ...item, quantity: item.quantity - 1 };
        }

        return item;
      })
      .filter((item) => item.quantity > 0);

    saveCart(newCart);
  }

  function removeItem(id: number) {
    const newCart = cart.filter((item) => item.id !== id);
    saveCart(newCart);
  }

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const articlesCount = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <main className="min-h-screen bg-[#f7f1e8] px-6 py-8 text-[#211815]">
      <header className="mx-auto max-w-6xl mb-8 rounded-[2rem] bg-white/70 p-6 shadow-xl border border-white">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-4">
            <img
              src="/logo-gabit.jpg"
              alt="GABIT"
              className="h-16 w-16 rounded-full object-cover shadow"
            />

            <div>
              <h1 className="text-3xl font-black text-[#4db8df]">
                Panier
              </h1>
              <p className="text-sm text-gray-600">
                Votre sélection GABIT
              </p>
            </div>
          </Link>

          <Link
            href="/"
            className="rounded-full bg-[#211815] px-5 py-3 text-white font-semibold hover:bg-[#4db8df] transition"
          >
            Boutique
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-5">
          {cart.length === 0 ? (
            <div className="rounded-[2rem] bg-white p-10 text-center shadow">
              <h2 className="text-3xl font-black">
                Votre panier est vide
              </h2>

              <p className="mt-2 text-gray-600">
                Ajoutez vos sacs préférés depuis la boutique.
              </p>

              <Link
                href="/"
                className="inline-block mt-6 rounded-full bg-[#4db8df] px-8 py-4 text-white font-bold"
              >
                Voir la collection
              </Link>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="rounded-[2rem] bg-white p-4 shadow-md border border-black/5 flex gap-4"
              >
                <img
                  src={getImageSrc(item.image)}
                  alt={item.name}
                  className="h-32 w-32 rounded-2xl object-contain bg-[#efe3d3]"
                />

                <div className="flex-1">
                  <h2 className="text-xl font-black">
                    {item.name}
                  </h2>

                  <div className="mt-1">
                    <p className="text-[#4db8df] font-black text-xl">
                      {item.price} DA
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-500">
                      + frais de livraison
                    </p>
                  </div>

                  {item.stock === 1 && (
                    <p className="mt-2 inline-block rounded-full bg-red-100 px-4 py-2 text-sm font-bold text-red-600">
                      Dernière pièce
                    </p>
                  )}

                  <div className="mt-4 flex items-center gap-3">
                    <button
                      onClick={() => decreaseQuantity(item.id)}
                      className="h-9 w-9 rounded-full bg-[#f7f1e8] font-bold"
                    >
                      -
                    </button>

                    <span className="font-bold">
                      {item.quantity}
                    </span>

                    <button
                      onClick={() => increaseQuantity(item.id)}
                      disabled={item.quantity >= item.stock}
                      className="h-9 w-9 rounded-full bg-[#211815] text-white font-bold disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => removeItem(item.id)}
                  className="self-start rounded-full bg-red-500 px-4 py-2 text-white text-sm font-bold"
                >
                  Supprimer
                </button>
              </div>
            ))
          )}
        </div>

        <aside className="rounded-[2rem] bg-white p-6 shadow-xl border border-black/5 h-fit">
          <h2 className="text-3xl font-black">
            Résumé
          </h2>

          <div className="mt-6 space-y-3">
            <div className="flex justify-between text-gray-600">
              <span>Articles</span>
              <span>{articlesCount}</span>
            </div>

            <div className="flex justify-between text-2xl font-black">
              <span>Total</span>

              <div className="text-right">
                <p className="text-[#4db8df]">
                  {total} DA
                </p>

                <p className="mt-1 text-sm font-semibold text-gray-500">
                  + frais de livraison
                </p>
              </div>
            </div>
          </div>

          <Link
            href="/checkout"
            className={`mt-6 block rounded-full py-4 text-center text-white font-black shadow-lg transition ${
              cart.length === 0
                ? "bg-gray-300 pointer-events-none"
                : "bg-[#4db8df] hover:scale-105"
            }`}
          >
            Passer la commande
          </Link>
        </aside>
      </section>
    </main>
  );
}