import axios from "axios";

export const handler = async (event) => {
  try {
    const search = event.queryStringParameters?.search || "";

    const params = { page: 1, limit: 10 };
    if (search) params.search = search;

    const res = await axios.get(
      "https://stageapi.monkcommerce.app/task/products/search",
      {
        params,
        headers: {
          "X-API-KEY": process.env.MONK_API_KEY,
        },
      }
    );

    return {
      statusCode: 200,
      body: JSON.stringify(res.data),
    };
  } catch (err) {
    return {
      statusCode: err.response?.status || 500,
      body: JSON.stringify({ error: "API failed" }),
    };
  }
};
