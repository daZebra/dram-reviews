// import getBlogPost from "@/lib/get-blog-post";
// import { ChevronLeftIcon } from "@radix-ui/react-icons";
// import Image from "next/image";

// type Props = {
//   params: { review: string };
// };

// export default async function Review({ params }: Props) {
//   const videoId = decodeURIComponent(params.review);

//   try {
//     console.log(videoId);
//     const { blogBody } = await getBlogPost(videoId);

//     // get Blog POst

//     return (
//       <section className="bg-white  py-10">
//         <div className="flex flex-col justify-center max-w-6xl mx-auto px-5 md:px-10 lg:px-40">
//           <div className="flex text-xs text-neutral-400">
//             <ChevronLeftIcon />
//             <a href="/">Back</a>
//           </div>
//           <div className=" px-4 mt-4">
//             <div className="bg-neutral rounded-lg overflow-hidden w-fit ">
//               <a
//                 href={`https://www.youtube.com/watch?v=${videoId}`}
//                 target="_blank"
//                 rel="noopener noreferrer"
//               >
//                 {" "}
//                 {/* Container to hold the image */}
//                 <Image
//                   src="https://i.ytimg.com/vi/3APeugNLwMA/mqdefault.jpg"
//                   alt="image"
//                   width={300}
//                   height={250}
//                   objectFit="fill" // Change to 'fill' to stretch and fill the area
//                   className="opacity-80 hover:opacity-100 transition" // Maintains the rounded corners
//                 />
//               </a>
//             </div>
//             <article>
//               {" "}
//               <div
//                 className="prose"
//                 dangerouslySetInnerHTML={{ __html: blogBody }}
//               />
//             </article>
//             {/* <h1 className="text-3xl font-bold">{blogTitle}</h1> */}
//             {/* <p className="text-sm text-base-content/80 ">{blogBody}</p> */}
//           </div>
//         </div>
//       </section>
//     );
//   } catch (error) {
//     return <div>Not found</div>;
//   }
// }
