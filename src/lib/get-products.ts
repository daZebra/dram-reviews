import prisma from "./db";

export async function getProducts(queryParams = {}) {
  // Construct the where condition dynamically based on queryParams input
  // console.log(queryParams);
  let whereCondition = {};
  let arrayFields = ["tasteNotes", "casks", "tags"]; // Add any other array fields here

  // Check if queryParams contain only valid fields
  const isValidQuery = Object.keys(queryParams).every((key) =>
    arrayFields.includes(key)
  );

  if (!isValidQuery) {
    // If an invalid field is found, return all products
    return await prisma.productItem.findMany({
      orderBy: {
        sentimentScore: "desc",
      },
    });
  }

  // Build the where condition based on the queryParams
  let andCondition = [];
  for (const [key, value] of Object.entries(queryParams)) {
    if (arrayFields.includes(key)) {
      if (Array.isArray(value)) {
        // Create an AND condition for multiple values
        const conditions = value.map((v) => ({ [key]: { contains: v } }));
        andCondition.push(...conditions);
      } else {
        // Handle single value condition
        whereCondition[key] = {
          contains: value,
        };
      }
    }
  }

  if (andCondition.length > 0) {
    whereCondition.AND = andCondition;
  }

  // Fetch products with the conditional where clause
  const products = await prisma.productItem.findMany({
    where: whereCondition,
    orderBy: {
      sentimentScore: "desc",
    },
  });

  // Count the total number of products in the database with the same condition
  const totalCount = await prisma.productItem.count({
    where: whereCondition,
  });

  return { products, totalCount };
}
