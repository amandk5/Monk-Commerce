export const fetchProducts = async (search = "", page = 1, limit = 10) => {
  try {
    const params = new URLSearchParams({
      page,
      limit,
    });

    // if (search?.trim()) {
    //   params.append("search", search.trim());
    // }

    const res = await fetch(
      `/.netlify/functions/fetchProducts?${params.toString()}`
    );

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();

    return (data || []).map((item) => ({
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

