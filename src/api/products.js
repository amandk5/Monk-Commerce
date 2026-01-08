export const fetchProducts = async (search = "") => {
  try {
    const qs = search ? `?search=${encodeURIComponent(search)}` : "";

    const res = await fetch(
      `/.netlify/functions/fetchProducts${qs}`
    );

    const data = await res.json();

    return data.map((item) => ({
      ...item,
      isSelected: false,
      variants:
        item.variants?.map((v) => ({
          ...v,
          isSelected: false,
        })) || [],
    }));
  } catch (err) {
    console.error("Failed to fetch products:", err);
    return [];
  }
};
