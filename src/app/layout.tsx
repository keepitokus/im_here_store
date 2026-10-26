import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["cyrillic", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["cyrillic", "latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Я здесь — Истории, к которым возвращаются | Магазин цифровых книг-подарков",
  description:
    "Создайте интерактивную книгу-подарок из собственных фотографий, дат и тёплых слов за 10–15 минут. Мгновенная приватная ссылка и QR-код после оплаты.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ru"
      className={`${cormorant.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FAF7F2] text-[#231C18] selection:bg-[#6E2638]/15 selection:text-[#6E2638]">
        {children}
      </body>
    </html>
  );
}
