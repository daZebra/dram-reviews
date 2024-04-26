import type { Metadata } from "next";
import { Inter, Roboto_Serif } from "next/font/google";
import "./globals.css";
import Header from "../components/header";
import Footer from "../components/footer";
import Container from "@/components/container";

const inter = Inter({ subsets: ["latin"] });
const robotoSerif = Roboto_Serif({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dram Reviews - Reviews from Whisky Experts",
  description: "The largest collection of reviews from Whisky experts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="myTheme">
      <body className={` bg-base-100 overflow-y-scroll `}>
        <Container>
          <Header />
          {children}
          <Footer />
        </Container>
      </body>
    </html>
  );
}
