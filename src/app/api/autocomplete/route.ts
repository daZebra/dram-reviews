import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Get query from URL
    const url = new URL(request.url);
    const query = url.searchParams.get("query");

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter is required" },
        { status: 400 }
      );
    }

    // Log the search string
    console.log(`Search string: ${query}`);

    // Make the search case-insensitive
    const productNames = await prisma.productItem.findMany({
      where: {
        productName: {
          startsWith: query,
          mode: "insensitive", // Make the search case-insensitive
        },
      },
      select: {
        productName: true,
      },
      take: 5,
    });

    // Respond with productNames in the correct format
    return NextResponse.json({
      productNames: productNames.map((item) => item.productName),
    });
  } catch (error) {
    console.error("Error in autocomplete API:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
