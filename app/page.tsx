"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Product = {
  id: number;
  name: string;
  price: number;
  old_price?: number | null;
  promo_price?: number | null;
  image: string;
  images?: string[];
  stock: number;
};

type CartItem = Product & {
  quantity: number;
};

function ProductCard({
  product,
  favorites,
  toggleFavorite,
  addToCart,
}: {
  product: Product;
  favorites: number[];
  toggleFavorite: (id: number) => void;
  addToCart: (product: Product) => void;
}) {
  const images =
    product.images && product.images.length > 0
      ? product.images
      : [product.image];

  const [currentImage, setCurrentImage] = useState(0);

  function nextImage() {
    setCurrentImage((prev) => (prev + 1) % images.length);
  }

  function prevImage() {
    setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }

  const displayPrice = product.promo_price || product.price;

  return (
    <div className="group overflow-hidden rounded-[2rem] bg-white shadow-md border border-black/5 hover:shadow-2xl transition">
      <div className="relative h-96 bg-[#efe3d3] overflow-hidden flex items-center justify-center">
        <button
          type="button"
          onClick={() => toggleFavorite(product.id)}
          className="absolute top-4 right-4 z-40 h-12 w-12 rounded-full bg-white shadow-lg text-2xl hover:scale-110 transition"
        >
          {favorites.includes(product.id) ? "⭐" : "☆"}
        </button>

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-40 h-12 w-12 rounded-full bg-white shadow-lg text-4xl font-bold flex items-center justify-center"
            >
              ‹
            </button>

            <button
              type="button"
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-40 h-12 w-12 rounded-full bg-white shadow-lg text-4xl font-bold flex items-center justify-center"
            >
              ›
            </button>
          </>
        )}

        <img
          src={images[currentImage]}
          alt={product.name}
          className="h-full w-full object-contain transition duration-500 group-hover:scale-105"
        />
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 p-3 overflow-x-auto bg-white">
          {images.map((img, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrentImage(index)}
              className={`h-16 w-16 shrink-0 rounded-xl border-2 overflow-hidden ${
                currentImage === index
                  ? "border-[#4db8df]"
                  : "border-black/10"
              }`}
            >
              <img src={img} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="p-5">
        <h3 className="text-xl font-black">{product.name}</h3>

        <div className="mt-3 flex items-center justify-between gap-3">
          <div>
            {product.old_price && product.promo_price ? (
              <div>
                <p className="text-gray-400 line-through text-lg font-bold">
                  {product.old_price} DA
                </p>
                <p className="text-2xl font-black text-[#4db8df]">
                  {product.promo_price} DA
                </p>
              </div>
            ) : (
              <p className="text-2xl font-black text-[#4db8df]">
                {product.price} DA
              </p>
            )}
          </div>

   <>
  {product.stock === 0 && (
    <p className="rounded-full px-4 py-2 text-sm font-bold bg-red-600 text-white">
      Rupture
    </p>
  )}

  {product.stock === 1 && (
    <p className="rounded-full px-4 py-2 text-sm font-bold bg-red-100 text-red-600">
      Stock : 1
    </p>
  )}
</>
        </div>

        {images.length > 1 && (
          <p className="mt-2 text-sm text-gray-500">
            Photo {currentImage + 1} / {images.length}
          </p>
        )}

        <button
          onClick={() => addToCart({ ...product, price: displayPrice })}
          disabled={product.stock <= 0}
          className="mt-5 w-full rounded-full bg-[#211815] py-4 font-bold text-white shadow-lg hover:bg-[#4db8df] transition disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {product.stock > 0 ? "Ajouter au panier" : "Rupture de stock"}
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState<number[]>([]);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

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

    const savedFavorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    setFavorites(savedFavorites);
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesFavorite = showOnlyFavorites
      ? favorites.includes(product.id)
      : true;

    return matchesSearch && matchesFavorite;
  });

  function toggleFavorite(productId: number) {
    const updatedFavorites = favorites.includes(productId)
      ? favorites.filter((id) => id !== productId)
      : [...favorites, productId];

    setFavorites(updatedFavorites);
    localStorage.setItem("favorites", JSON.stringify(updatedFavorites));

    if (showOnlyFavorites && updatedFavorites.length === 0) {
      setShowOnlyFavorites(false);
    }
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
      cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    alert("Produit ajouté au panier");
  }

  return (
    <main className="min-h-screen bg-[#f7f1e8] text-[#211815]">
      <header className="px-6 py-10">
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

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
                className={`rounded-full px-4 py-3 font-bold shadow transition ${
                  showOnlyFavorites
                    ? "bg-[#4db8df] text-white"
                    : "bg-[#f7f1e8] text-[#211815] hover:bg-[#4db8df] hover:text-white"
                }`}
              >
                ⭐ {favorites.length}
              </button>

              <Link
                href="/cart"
                className="rounded-full bg-[#211815] px-5 py-3 text-sm md:text-base font-semibold text-white shadow-lg hover:bg-[#4db8df] transition"
              >
                Panier
              </Link>
            </div>
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
        <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h2 className="text-3xl md:text-5xl font-black">
              {showOnlyFavorites ? "Mes favoris" : "Nos sacs"}
            </h2>
            <p className="mt-2 text-gray-600">
              {showOnlyFavorites
                ? "Vos sacs préférés"
                : "Sélection officielle GABIT"}
            </p>
          </div>

          <input
            type="text"
            placeholder="Rechercher un sac..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-96 rounded-full bg-white px-6 py-4 shadow border border-black/5 text-[#211815]"
          />
        </div>

        {showOnlyFavorites && favorites.length > 0 && (
          <button
            onClick={() => setShowOnlyFavorites(false)}
            className="mb-6 rounded-full bg-[#211815] px-5 py-3 text-white font-bold"
          >
            Voir tous les sacs
          </button>
        )}

        {filteredProducts.length === 0 ? (
          <div className="rounded-[2rem] bg-white p-10 text-center shadow">
            <h3 className="text-2xl font-black">
              {showOnlyFavorites
                ? "Aucun favori pour le moment"
                : "Aucun produit trouvé"}
            </h3>
            <p className="mt-2 text-gray-600">
              {showOnlyFavorites
                ? "Clique sur ☆ pour ajouter un sac aux favoris."
                : "Essaie un autre nom de sac."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                favorites={favorites}
                toggleFavorite={toggleFavorite}
                addToCart={addToCart}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}