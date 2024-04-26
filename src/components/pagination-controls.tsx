"use client";

import { ArrowLeftIcon, ArrowRightIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import React from "react";

export default function PaginationControls({
  previousPath,
  nextPath,
}: {
  previousPath: string;
  nextPath: string;
}) {
  const btnClasses =
    "flex items-center gap-x-2 text-white px-5 py-3 bg-white/5 rounded-md opacity-75 hover:opacity-100 transition text-sm";

  return (
    <section className="flex justify-between w-full ">
      {previousPath ? (
        <Link className={btnClasses} href={previousPath}>
          {" "}
          <ArrowLeftIcon /> Previous
        </Link>
      ) : (
        <div />
      )}
      {nextPath ? (
        <Link className={btnClasses} href={nextPath}>
          {" "}
          Next <ArrowRightIcon />
        </Link>
      ) : (
        <div />
      )}
    </section>
  );
}
