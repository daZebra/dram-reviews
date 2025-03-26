import prisma from "./db";

export async function getProduct(productName: string) {
  console.log(`[getProduct] Searching for product: "${productName}"`);

  // Convert the search query to lowercase
  const lowerCaseProductName = productName.toLowerCase();
  console.log(
    `[getProduct] Normalized product name to: "${lowerCaseProductName}"`
  );

  try {
    const product = await prisma.productItem.findUnique({
      where: {
        productName: lowerCaseProductName,
      },
    });

    if (product) {
      console.log(`[getProduct] Found product: "${product.productName}"`);
    } else {
      console.log(
        `[getProduct] No product found for: "${lowerCaseProductName}"`
      );
    }

    return product || null;
  } catch (error) {
    console.error(`[getProduct] Error fetching product:`, error);
    throw error;
  }
}
