import type { Food } from "@/types";

const USER_AGENT = "FoodTrack/1.0 (Expo)";
const API_BASE_URL = "https://fr.openfoodfacts.org";

function getProductName(product: {
  product_name?: string;
  product_name_fr?: string;
  product_name_en?: string;
}): string {
  return (
    product.product_name_fr ||
    product.product_name_en ||
    product.product_name ||
    "Produit sans nom"
  );
}

function mapApiProductToFood(product: any): Food {
  const nutriments = product?.nutriments || {};
  return {
    id: String(product.code || Math.random()),
    name: getProductName(product),
    brand: product.brands || undefined,
    image_url: product.image_url || undefined,
    nutriscore: product.nutriscore_grade || undefined,
    calories: Number(nutriments["energy-kcal_100g"]) || 0,
    proteins: Number(nutriments["proteins_100g"]) || 0,
    carbs: Number(nutriments["carbohydrates_100g"]) || 0,
    fats: Number(nutriments["fat_100g"]) || 0,
    quantity: 100,
  };
}

export async function searchProducts(query: string): Promise<Food[]> {
  const url = `${API_BASE_URL}/cgi/search.pl?${new URLSearchParams({
    search_terms: query,
    simple: "1",
    action: "process",
    json: "1",
    fields:
      "code,product_name,product_name_fr,product_name_en,brands,nutriments,image_url,nutriscore_grade",
    page_size: "10",
  }).toString()}`;

  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
  });

  if (!response.ok) {
    throw new Error("Erreur lors de la recherche");
  }

  const data = await response.json();
  const products = Array.isArray(data.products) ? data.products : [];
  return products.map(mapApiProductToFood);
}

export async function getProductByBarcode(
  barcode: string,
): Promise<Food | null> {
  const url = `${API_BASE_URL}/api/v2/product/${encodeURIComponent(barcode)}.json?${new URLSearchParams(
    {
      fields:
        "code,product_name,product_name_fr,product_name_en,brands,nutriments,image_url,nutriscore_grade",
    },
  ).toString()}`;

  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
  });

  if (!response.ok) {
    throw new Error("Erreur réseau");
  }

  const data = await response.json();

  if (!data || data.status !== 1 || !data.product) {
    return null;
  }

  return mapApiProductToFood(data.product);
}
