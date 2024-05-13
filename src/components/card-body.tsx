// import { ReviewItem } from "@prisma/client";
// import Divider from "./divider";
// import Highlighter from "react-highlight-words";
// import { FLAVOUR_WORDS } from "@/lib/const";

// type CardBodyProps = {
//   isOpen: boolean;
//   review: ReviewItem;
// };

// export default function CardBody({ isOpen, review }: CardBodyProps) {
//   return (
//     <div>
//       {isOpen && (
//         <>
//           <CardSection
//             quotes={review.tasteProfile}
//             sectionType="Tasting Notes"
//           />
//           <Divider />
//           <CardSection quotes={review.whiskyReview} sectionType="Review" />
//           <Divider />
//           <CardSection quotes={review.critique} sectionType="Critique" />
//         </>
//       )}
//     </div>
//   );
// }

// type CardSectionProps = {
//   quotes: string;
//   sectionType: string;
// };

// type QuoteArray = string[]; // Adjust this type according to your actual data structure.

// export function CardSection({ quotes, sectionType }: CardSectionProps) {
//   // Assume that quotes is a JSON-stringified array of strings:
//   const quotesArray: QuoteArray = JSON.parse(quotes);

//   const flavorWords = FLAVOUR_WORDS;

//   const quotesElements = quotesArray.map((quote, index) => {
//     if (typeof quote === "string") {
//       // Ensure quote is a string
//       return (
//         <li key={index}>
//           <Highlighter
//             highlightClassName="highlight-flavor"
//             searchWords={flavorWords}
//             autoEscape={true}
//             textToHighlight={quote}
//             highlightStyle={{
//               backgroundColor: "#F9E5C2",
//             }}
//           />
//         </li>
//       );
//     }
//     return null; // Or handle non-string data appropriately
//   });

//   return (
//     <section className="flex flex-col px-4 py-4 font-serif">
//       <div className="flex flex-col md:flex-row justify-start sm:gap-2 md:gap-4 text-center">
//         <div className="flex flex-col justify-center min-w-36 bg-base-100 rounded-md text-base-content/90">
//           <h3 className="text-md font-bold">{sectionType}</h3>
//         </div>
//         <ul className="md:text-left text-base-content/80">{quotesElements}</ul>
//       </div>
//     </section>
//   );
// }
