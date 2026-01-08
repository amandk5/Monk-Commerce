exports.handler = async (event) => {
  try {
    const search = event.queryStringParameters?.search || "";

    const params = new URLSearchParams({
      page: "1",
      limit: "10",
    });

    if (search) params.append("search", search);

    const res = await fetch(
      `https://stageapi.monkcommerce.app/task/products/search?${params}`,
      {
        headers: {
          "X-API-KEY": process.env.MONK_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
      const text = await res.text();
      return {
        statusCode: res.status,
        body: JSON.stringify({ error: text }),
      };
    }

    const data = await res.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
