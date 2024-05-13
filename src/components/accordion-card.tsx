// "use client";

// import { useState } from "react";
// import CardBody from "./card-body";
// import CardHeader from "./card-header";
// import { ReviewItem } from "@prisma/client";

// type AccordionCardProps = {
//   review: ReviewItem;
// };

// export default function AccordionCard({ review }: AccordionCardProps) {
//   const [isOpen, setIsOpen] = useState(false);

//   const toggleAccordion = () => setIsOpen(!isOpen);
//   return (
//     <section className="flex flex-col bg-white shadow-md shadow-base-200/40 rounded-lg overflow-hidden">
//       <CardHeader onClick={toggleAccordion} review={review} />
//       <CardBody isOpen={isOpen} review={review} />
//     </section>
//   );
// }
