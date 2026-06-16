"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Product = {
  id: number;
  name: string;
  price: number;
  image: string;
  stock: number;
};

type CartItem = Product & {
  quantity: number;
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function getProducts() {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("id", { ascending: true });

      if (error) {
        alert("Erreur Supabase : " + error.message);
        return;
      }

      setProducts(data || []);
    }

    getProducts();
  }, []);

  function getImageSrc(image: string) {
    if (image.startsWith("http")) return image;
    return `/${image.trim()}`;
  }

  function addToCart(product: Product) {
    if (product.stock <= 0) {
      alert("Produit en rupture de stock");
      return;
    }

    const cart: CartItem[] = JSON.parse(localStorage.getItem("cart") || "[]");

    const existing = cart.find((item) => item.id === product.id);

    if (existing) {
      if (existing.quantity >= product.stock) {
        alert("Stock insuffisant");
        return;
      }

      existing.quantity += 1;
    } else {
      cart.push({
        ...product,
        quantity: 1,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    alert("Produit ajouté au panier");
  }

  return (
    <main className="min-h-screen bg-[#f7f1e8] text-[#211815]">
      <header className="relative overflow-hidden px-6 py-10">
        <div className="mx-auto max-w-7xl rounded-[2rem] bg-white/70 shadow-xl border border-white p-6 md:p-10">
          <nav className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src="/logo-gabit.jpg"
                alt="GABIT"
                className="h-20 w-20 rounded-full object-cover shadow-md"
              />

              <div>
                <h1 className="text-3xl md:text-5xl font-black tracking-wide text-[#4db8df]">
                  GABIT
                </h1>
                <p className="text-sm md:text-base text-gray-600">
                  Collection officielle
                </p>
              </div>
            </div>

            <Link
              href="/cart"
              className="rounded-full bg-[#211815] px-5 py-3 text-sm md:text-base font-semibold text-white shadow-lg hover:bg-[#4db8df] transition"
            >
              Panier
            </Link>
          </nav>

          <section className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-[#4db8df]">
                Luxury Bags
              </p>

              <h2 className="text-4xl md:text-7xl font-black leading-tight">
                Élégance moderne pour chaque jour.
              </h2>

              <p className="mt-5 max-w-xl text-gray-600 text-lg leading-8">
                Découvrez les sacs GABIT : modernes, raffinés et pensés pour un
                style chic.
              </p>

              <a
                href="#products"
                className="inline-block mt-7 rounded-full bg-[#4db8df] px-8 py-4 font-bold text-white shadow-xl hover:scale-105 transition"
              >
                Voir la collection
              </a>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 rounded-full bg-[#4db8df]/20 blur-3xl" />
              <img
                src="/logo-gabit.jpg"
                alt="Logo GABIT"
                className="relative mx-auto h-72 w-72 md:h-96 md:w-96 rounded-full object-cover shadow-2xl border border-white"
              />
            </div>
          </section>
        </div>
      </header>

      <section id="products" className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl md:text-5xl font-black">
              Nos sacs
            </h2>
            <p className="mt-2 text-gray-600">
              Sélection officielle GABIT
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {products.map((product) => (
            <div
              key={product.id}
              className="group overflow-hidden rounded-[2rem] bg-white shadow-md border border-black/5 hover:shadow-2xl transition"
            >
              <div className="h-96 bg-[#efe3d3] overflow-hidden flex items-center justify-center">
                <img
                  src={getImageSrc(product.image)}
                  alt={product.name}
                  className="h-full w-full object-contain transition duration-500 group-hover:scale-105"
                />
              </div>

              <div className="p-5">
                <h3 className="text-xl font-black">{product.name}</h3>

                <div className="mt-3 flex items-center justify-between">
                  <p className="text-2xl font-black text-[#4db8df]">
                    {product.price} DA
                  </p>

                  <p className="rounded-full bg-[#f7f1e8] px-4 py-2 text-sm font-semibold">
                    Stock : {product.stock}
                  </p>
                </div>

                <button
                  onClick={() => addToCart(product)}
                  disabled={product.stock <= 0}
                  className="mt-5 w-full rounded-full bg-[#211815] py-4 font-bold text-white shadow-lg hover:bg-[#4db8df] transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {product.stock > 0 ? "Ajouter au panier" : "Rupture de stock"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}