import prisma from "@/lib/db";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  productNames?: string[];
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: "Query parameter is required" });
    }

    // Ensure query is a string
    const searchString = Array.isArray(query) ? query[0] : query;
    console.log(`Search string: ${searchString}`); // Log the search string

    // Make the search case-insensitive
    const productNames = await prisma.productItem.findMany({
      where: {
        productName: {
          startsWith: searchString,
          mode: "insensitive", // Make the search case-insensitive
        },
      },
      select: {
        productName: true,
      },
      take: 5,
    });

    // Respond with productNames in the correct format
    res
      .status(200)
      .json({ productNames: productNames.map((item) => item.productName) });
  } catch (error) {
    console.error("Error in autocomplete API:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
