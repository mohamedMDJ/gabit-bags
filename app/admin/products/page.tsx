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

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getProducts();
  }, []);

  async function getProducts() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      alert("Erreur produits : " + error.message);
      return;
    }

    setProducts(data || []);
  }

  function getImageSrc(product: Product) {
    if (product.images && product.images.length > 0) return product.images[0];
    if (product.image && product.image.startsWith("http")) return product.image;
    return `/${product.image?.trim()}`;
  }

  async function uploadImages(selectedFiles: File[]) {
    const uploadedUrls: string[] = [];

    for (const file of selectedFiles) {
      const fileName = `${Date.now()}-${Math.random()}-${file.name}`;

      const { error } = await supabase.storage
        .from("products")
        .upload(fileName, file);

      if (error) throw new Error(error.message);

      const { data } = supabase.storage.from("products").getPublicUrl(fileName);
      uploadedUrls.push(data.publicUrl);
    }

    return uploadedUrls;
  }

  async function addProduct() {
    if (!name || !price || !stock || files.length === 0) {
      alert("Remplis tous les champs et choisis au moins une photo.");
      return;
    }

    setLoading(true);

    try {
      const uploadedUrls = await uploadImages(files);

      const { error } = await supabase.from("products").insert({
        name,
        price: Number(price),
        old_price: null,
        promo_price: null,
        stock: Number(stock),
        image: uploadedUrls[0],
        images: uploadedUrls,
      });

      if (error) {
        alert("Erreur ajout produit : " + error.message);
        setLoading(false);
        return;
      }

      setName("");
      setPrice("");
      setStock("");
      setFiles([]);

      await getProducts();
      alert("Produit ajouté !");
    } catch (error: any) {
      alert("Erreur upload : " + error.message);
    }

    setLoading(false);
  }

  async function updatePrice(product: Product) {
    const newPrice = prompt("Nouveau prix :", String(product.price));
    if (newPrice === null) return;

    await supabase
      .from("products")
      .update({
        price: Number(newPrice),
        old_price: null,
        promo_price: null,
      })
      .eq("id", product.id);

    getProducts();
  }

  async function updateStock(product: Product) {
    const newStock = prompt("Nouveau stock :", String(product.stock));
    if (newStock === null) return;

    await supabase
      .from("products")
      .update({ stock: Number(newStock) })
      .eq("id", product.id);

    getProducts();
  }

  async function updatePhotos(product: Product) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;

    input.onchange = async () => {
      const selectedFiles = input.files ? Array.from(input.files) : [];
      if (selectedFiles.length === 0) return;

      const ok = confirm("Remplacer toutes les photos de ce produit ?");
      if (!ok) return;

      setLoading(true);

      try {
        const uploadedUrls = await uploadImages(selectedFiles);

        const { error } = await supabase
          .from("products")
          .update({
            image: uploadedUrls[0],
            images: uploadedUrls,
          })
          .eq("id", product.id);

        if (error) {
          alert("Erreur modification photos : " + error.message);
          setLoading(false);
          return;
        }

        await getProducts();
        alert("Photos modifiées !");
      } catch (error: any) {
        alert("Erreur upload : " + error.message);
      }

      setLoading(false);
    };

    input.click();
  }

  async function addPromotion(product: Product) {
    const promo = prompt(
      "Nouveau prix promotionnel :",
      String(product.promo_price || product.price)
    );

    if (promo === null) return;

    const promoNumber = Number(promo);

    if (!promoNumber || promoNumber <= 0) {
      alert("Prix promotionnel invalide.");
      return;
    }

    await supabase
      .from("products")
      .update({
        old_price: product.old_price || product.price,
        promo_price: promoNumber,
        price: promoNumber,
      })
      .eq("id", product.id);

    getProducts();
  }

  async function removePromotion(product: Product) {
    const originalPrice = product.old_price || product.price;

    await supabase
      .from("products")
      .update({
        price: originalPrice,
        old_price: null,
        promo_price: null,
      })
      .eq("id", product.id);

    getProducts();
  }

  async function deleteProduct(id: number) {
    const ok = confirm("Supprimer ce produit ?");
    if (!ok) return;

    await supabase.from("products").delete().eq("id", id);
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
            <h1 className="text-4xl font-black text-[#4db8df]">Produits</h1>
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
            multiple
            className="rounded-2xl border border-black/10 bg-[#f7f1e8] p-4"
            onChange={(e) =>
              setFiles(e.target.files ? Array.from(e.target.files) : [])
            }
          />
        </div>

        {files.length > 0 && (
          <p className="mt-3 text-gray-600">
            {files.length} photo(s) sélectionnée(s)
          </p>
        )}

        <button
          onClick={addProduct}
          disabled={loading}
          className="mt-5 w-full rounded-full bg-[#4db8df] py-4 text-white font-black shadow-lg disabled:bg-gray-300"
        >
          {loading ? "Chargement..." : "Ajouter le produit"}
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
                src={getImageSrc(product)}
                alt={product.name}
                className="h-full w-full object-contain"
              />
            </div>

            <div className="p-5">
              <h2 className="text-xl font-black">{product.name}</h2>

              <div className="mt-2">
                {product.old_price && product.promo_price ? (
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 line-through text-lg font-bold">
                      {product.old_price} DA
                    </span>
                    <span className="text-[#4db8df] text-2xl font-black">
                      {product.promo_price} DA
                    </span>
                  </div>
                ) : (
                  <p className="text-[#4db8df] text-2xl font-black">
                    {product.price} DA
                  </p>
                )}
              </div>

              <p className="text-gray-600 mt-1">Stock : {product.stock}</p>

              <p className="text-sm text-gray-500 mt-1">
                Photos : {product.images?.length || 1}
              </p>

              <button
                onClick={() => updatePrice(product)}
                className="mt-4 w-full rounded-full bg-[#211815] text-white py-3 font-bold"
              >
                Modifier prix
              </button>

              <button
                onClick={() => updateStock(product)}
                className="mt-3 w-full rounded-full bg-[#4db8df] text-white py-3 font-bold"
              >
                Modifier stock
              </button>

              <button
                onClick={() => updatePhotos(product)}
                className="mt-3 w-full rounded-full bg-purple-500 text-white py-3 font-bold"
              >
                Modifier photos
              </button>

              <button
                onClick={() => addPromotion(product)}
                className="mt-3 w-full rounded-full bg-green-600 text-white py-3 font-bold"
              >
                Ajouter promotion
              </button>

              {product.old_price && product.promo_price && (
                <button
                  onClick={() => removePromotion(product)}
                  className="mt-3 w-full rounded-full bg-orange-500 text-white py-3 font-bold"
                >
                  Retirer promotion
                </button>
              )}

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