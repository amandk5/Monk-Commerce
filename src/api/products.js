import axios from "axios";

const API_URL = "https://stageapi.monkcommerce.app/task/products/search";
const API_KEY = process.env.MONK_API_KEY;

export const fetchProducts = async (search = "") => {
  try {
    const params = { page: 1, limit: 10 };
    if (search.trim()) {
      params.search = search.trim();
    }

    const { data } = await axios.get(API_URL, {
      params,
      headers: { "x-api-key": API_KEY },
    });

    return data.map((item) => ({
      ...item,
      isSelected: false,
      variants: item.variants?.map((v) => ({ ...v, isSelected: false })) || [],
    }));
  } catch (err) {
    console.error("Failed to fetch products:", err);
    return [];
  }
};


