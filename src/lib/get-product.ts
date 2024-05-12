import prisma from "./db";

export async function getProduct(productName: string) {
  // Convert the search query to lowercase
  const lowerCaseProductName = productName.toLowerCase();

  const product = await prisma.productItem.findUnique({
    where: {
      productName: lowerCaseProductName,
    },
  });

  return product || null;
}
