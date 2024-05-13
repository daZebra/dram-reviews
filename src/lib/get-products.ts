import { Prisma, ProductItem } from "@prisma/client";
import prisma from "./db";

export type ProductQueryParams = {
  casks?: string[];
  tasteNotes?: string[];
  tags?: string[];
};

type ProductsResponse = {
  products: ProductItem[];
  totalCount: number;
};

export async function getProducts(
  queryParams: ProductQueryParams = {}
): Promise<ProductsResponse> {
  let whereCondition: {
    AND?: Prisma.ProductItemWhereInput[];
  } = {};
  let arrayFields = ["tasteNotes", "casks", "tags"] as const;

  const isValidQuery = Object.keys(queryParams).every((key) =>
    arrayFields.includes(key as any)
  );

  if (!isValidQuery) {
    return {
      products: await prisma.productItem.findMany({
        orderBy: {
          sentimentScore: "desc",
        },
      }),
      totalCount: await prisma.productItem.count(),
    };
  }

  let andCondition: Prisma.ProductItemWhereInput[] = [];
  for (const [key, value] of Object.entries(queryParams)) {
    if (arrayFields.includes(key as any) && Array.isArray(value)) {
      const conditions = value.map((v) => ({ [key]: { contains: v } }));
      andCondition.push(...conditions);
    }
  }

  if (andCondition.length > 0) {
    whereCondition.AND = andCondition;
  }

  const products = await prisma.productItem.findMany({
    where: whereCondition,
    orderBy: {
      sentimentScore: "desc",
    },
  });

  const totalCount = await prisma.productItem.count({
    where: whereCondition,
  });

  return { products, totalCount };
}

// import { Prisma, ProductItem } from "@prisma/client";
// import prisma from "./db";

// type ProductQueryParams = {
//   casks?: string[];
//   tasteNotes?: string[];
//   tags?: string[];
// };

// type ProductsResponse = {
//   products: ProductItem[];
//   totalCount: number;
// };

// export async function getProducts(
//   queryParams: ProductQueryParams = {}
// ): Promise<ProductsResponse> {
//   // Construct the where condition dynamically based on queryParams input
//   // console.log(queryParams);
//   let whereCondition: {
//     AND?: Prisma.ProductItemWhereInput[];
//   } = {};
//   let arrayFields = ["tasteNotes", "casks", "tags"] as const; // Add any other array fields here

//   // Check if queryParams contain only valid fields
//   const isValidQuery = Object.keys(queryParams).every((key) =>
//     arrayFields.includes(key)
//   );

//   if (!isValidQuery) {
//     // If an invalid field is found, return all products
//     return {
//       products: await prisma.productItem.findMany({
//         orderBy: {
//           sentimentScore: "desc",
//         },
//       }),
//       totalCount: await prisma.productItem.count(),
//     };
//   }

//   // Build the where condition based on the queryParams
//   let andCondition: Prisma.ProductItemWhereInput[] = [];
//   for (const [key, value] of Object.entries(queryParams)) {
//     if (arrayFields.includes(key as (typeof arrayFields)[number])) {
//       if (Array.isArray(value)) {
//         // Create an AND condition for multiple values
//         const conditions = value.map((v) => ({ [key]: { contains: v } }));
//         andCondition.push(...conditions);
//       } else {
//         // Handle single value condition
//         let whereCondition: {
//           [key: string]: Prisma.ProductItemWhereInput | undefined;
//         } = {};
//       }
//     }
//   }

//   if (andCondition.length > 0) {
//     whereCondition.AND = andCondition;
//   }

//   // Fetch products with the conditional where clause
//   const products = await prisma.productItem.findMany({
//     where: whereCondition,
//     orderBy: {
//       sentimentScore: "desc",
//     },
//   });

//   // Count the total number of products in the database with the same condition
//   const totalCount = await prisma.productItem.count({
//     where: whereCondition,
//   });

//   return { products, totalCount };
// }
