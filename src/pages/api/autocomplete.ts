import prisma from "@/lib/db";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  productNames?: string[];
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: "Query parameter is required" });
    }

    const productNames = await prisma.productItem.findMany({
      where: {
        productName: {
          startsWith: query,
          // mode: "insensitive",
        },
      },
      select: {
        productName: true,
      },
      take: 5,
    });

    res.status(200).json(productNames.map((item) => item.productName));
  } catch (error) {
    console.error("Error in autocomplete API:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
