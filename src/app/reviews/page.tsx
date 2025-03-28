import ProductOverviewCard from "@/components/product-overview-card";
import { getProducts, ProductQueryParams } from "@/lib/get-products";

export default async function Reviews({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Convert searchParams object to ProductQueryParams
  const productQueryParams: ProductQueryParams = {};

  if (searchParams.casks) {
    productQueryParams.casks = Array.isArray(searchParams.casks)
      ? searchParams.casks
      : [searchParams.casks];
  }
  if (searchParams.tasteNotes) {
    productQueryParams.tasteNotes = Array.isArray(searchParams.tasteNotes)
      ? searchParams.tasteNotes
      : [searchParams.tasteNotes];
  }
  if (searchParams.tags) {
    productQueryParams.tags = Array.isArray(searchParams.tags)
      ? searchParams.tags
      : [searchParams.tags];
  }

  const { products, totalCount } = await getProducts(productQueryParams);

  if (!products) {
    return <div>No products found</div>;
  }

  return (
    <div className="flex flex-col items-center text-center my-10">
      <h2 className={`text-2xl text-base-content/50`}>
        {totalCount === 0
          ? "No products found, try a different search"
          : Object.keys(productQueryParams).length > 0
          ? `${totalCount} whiskies found`
          : `Expert reviews for over ${totalCount} whiskies`}
      </h2>
      <section className="flex flex-col items-center w-full px-8 md:max-w-4xl gap-10 py-10">
        {products.map((product) => (
          <ProductOverviewCard key={product.productName} product={product} />
        ))}
      </section>
      {/* <button className="btn btn-outline rounded-full">Show more</button> */}
    </div>
  );
}

// import ProductOverviewCard from "@/components/product-overview-card";
// import { getProducts } from "@/lib/get-products";

// export default async function Reviews({
//   searchParams,
// }: {
//   searchParams: URLSearchParams;
// }) {
//   // console.log(searchParams);
//   const { products, totalCount } = await getProducts(searchParams);

//   if (!products) {
//     return <div>No products found</div>;
//   }
//   return (
//     <div className="flex flex-col items-center text-center my-10">
//       <h2 className={` text-2xl text-base-content/50`}>
//         {totalCount === 0
//           ? "No products found, try a different search"
//           : Object.keys(searchParams).length > 0
//           ? `${totalCount} whiskies found`
//           : `Expert reviews for over ${totalCount} whiskies`}
//       </h2>
//       <section className="flex flex-col items-center w-full px-8 md:max-w-4xl gap-10 py-10">
//         {products.map((product) => (
//           <ProductOverviewCard key={product.productName} product={product} />
//         ))}
//       </section>
//       {/* <button className="btn btn-outline rounded-full">Show more</button> */}
//     </div>
//   );
// }
