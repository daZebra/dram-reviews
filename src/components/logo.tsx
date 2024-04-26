import Link from "next/link";
import Image from "next/image";

export default function Logo() {
  return (
    <Link className="text-sm font-bold text-accent" href="/">
      <Image src="/logo.png" alt="logo" width={120} height={40} />
    </Link>
  );
}
