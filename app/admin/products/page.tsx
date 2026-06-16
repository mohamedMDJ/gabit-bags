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

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getProducts();
  }, []);

  async function getProducts() {
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: true });

    setProducts(data || []);
  }

  function getImageSrc(image: string) {
    if (image.startsWith("http")) return image;
    return `/${image.trim()}`;
  }

  async function addProduct() {
    if (!name || !price || !stock || !file) {
      alert("Remplis tous les champs et choisis une photo.");
      return;
    }

    setLoading(true);

    const fileName = `${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("products")
      .upload(fileName, file);

    if (uploadError) {
      alert("Erreur upload : " + uploadError.message);
      setLoading(false);
      return;
    }

    const { data } = supabase.storage.from("products").getPublicUrl(fileName);

    const { error } = await supabase.from("products").insert({
      name,
      price: Number(price),
      image: data.publicUrl,
      stock: Number(stock),
    });

    if (error) {
      alert("Erreur ajout produit : " + error.message);
      setLoading(false);
      return;
    }

    setName("");
    setPrice("");
    setStock("");
    setFile(null);
    await getProducts();
    setLoading(false);

    alert("Produit ajouté !");
  }

  async function deleteProduct(id: number) {
    await supabase.from("products").delete().eq("id", id);
    getProducts();
  }

  async function updatePrice(id: number, oldPrice: number) {
    const newPrice = prompt("Nouveau prix :", String(oldPrice));
    if (newPrice === null) return;

    await supabase
      .from("products")
      .update({ price: Number(newPrice) })
      .eq("id", id);

    getProducts();
  }

  async function updateStock(id: number, oldStock: number) {
    const newStock = prompt("Nouveau stock :", String(oldStock));
    if (newStock === null) return;

    await supabase
      .from("products")
      .update({ stock: Number(newStock) })
      .eq("id", id);

    getProducts();
  }

  return (
    <main className="min-h-screen bg-[#f7f1e8] p-6 text-[#211815]">
      <header className="max-w-7xl mx-auto mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img
            src="/logo-gabit.jpg"
            alt="GABIT"
            className="h-16 w-16 rounded-full object-cover shadow"
          />

          <div>
            <h1 className="text-4xl font-black text-[#4db8df]">
              Produits
            </h1>
            <p className="text-gray-600">Gestion des sacs GABIT</p>
          </div>
        </div>

        <Link
          href="/admin"
          className="rounded-full bg-[#211815] text-white px-5 py-3 font-bold"
        >
          Retour
        </Link>
      </header>

      <section className="max-w-7xl mx-auto rounded-[2rem] bg-white p-6 shadow-xl mb-8">
        <h2 className="text-3xl font-black mb-5">Ajouter un sac</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            className="rounded-2xl border border-black/10 bg-[#f7f1e8] p-4"
            placeholder="Nom du sac"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="rounded-2xl border border-black/10 bg-[#f7f1e8] p-4"
            placeholder="Prix"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />

          <input
            className="rounded-2xl border border-black/10 bg-[#f7f1e8] p-4"
            placeholder="Stock"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
          />

          <input
            type="file"
            accept="image/*"
            className="rounded-2xl border border-black/10 bg-[#f7f1e8] p-4"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>

        <button
          onClick={addProduct}
          disabled={loading}
          className="mt-5 w-full rounded-full bg-[#4db8df] py-4 text-white font-black shadow-lg disabled:bg-gray-300"
        >
          {loading ? "Ajout..." : "Ajouter le produit"}
        </button>
      </section>

      <section className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
        {products.map((product) => (
          <div
            key={product.id}
            className="overflow-hidden rounded-[2rem] bg-white shadow-xl border border-black/5"
          >
            <div className="h-80 bg-[#efe3d3] flex items-center justify-center">
              <img
                src={getImageSrc(product.image)}
                alt={product.name}
                className="h-full w-full object-contain"
              />
            </div>

            <div className="p-5">
              <h2 className="text-xl font-black">{product.name}</h2>
              <p className="text-[#4db8df] text-2xl font-black mt-2">
                {product.price} DA
              </p>
              <p className="text-gray-600 mt-1">Stock : {product.stock}</p>

              <button
                onClick={() => updatePrice(product.id, product.price)}
                className="mt-4 w-full rounded-full bg-[#211815] text-white py-3 font-bold"
              >
                Modifier prix
              </button>

              <button
                onClick={() => updateStock(product.id, product.stock)}
                className="mt-3 w-full rounded-full bg-[#4db8df] text-white py-3 font-bold"
              >
                Modifier stock
              </button>

              <button
                onClick={() => deleteProduct(product.id)}
                className="mt-3 w-full rounded-full bg-red-500 text-white py-3 font-bold"
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}