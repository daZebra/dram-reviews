"use client";

import Link from "next/link";
import Logo from "./logo";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const routes = [
  {
    name: "Home",
    path: "/",
  },
  {
    name: "All Reviews",
    path: "/reviews",
  },
];
export default function Header() {
  const activePathname = usePathname();

  return (
    <header className="flex justify-between items-center border-b border-neutral/10 h-14 px-3 sm:px-9">
      <Logo />
      <nav className="h-full">
        <ul className="flex gap-x-6 h-full text-sm">
          {routes.map((route) => (
            <li
              key={route.path}
              className={cn(
                "font-serif hover:text-base-content flex items-center relative transition",
                {
                  "text-base-content": activePathname === route.path,
                  "text-base-content/50": activePathname !== route.path,
                }
              )}
            >
              <Link href={route.path}>{route.name}</Link>
              {activePathname === route.path && (
                <motion.div
                  layoutId="header-active-link"
                  className="bg-primary h-1 w-full absolute bottom-0"
                />
              )}
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
