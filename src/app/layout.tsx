import type { Metadata } from "next";
import { Inter, Roboto_Serif } from "next/font/google";
import "./globals.css";
import Header from "../components/header";
import Footer from "../components/footer";
import Container from "@/components/container";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });
const robotoSerif = Roboto_Serif({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Whiskies reviewed by your favorite Youtube experts",
  description: "Get help from experts choosing your next whisky.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="myTheme">
      <body className={` bg-base-100 overflow-y-scroll `}>
        <Analytics />
        <Container>
          <Header />
          {children}
          <Footer />
        </Container>
      </body>
    </html>
  );
}
