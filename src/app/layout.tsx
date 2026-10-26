import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, Marck_Script } from "next/font/google";
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

const marck = Marck_Script({
  variable: "--font-script",
  subsets: ["cyrillic", "latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:43123"),
  title: {
    default: "Я здесь — цифровые книги для самых близких",
    template: "%s · Я здесь",
  },
  description:
    "Соберите фотографии, воспоминания и важные слова в красивую интерактивную книгу. Создайте сами и подарите по ссылке. От 4 990 ₽.",
  openGraph: {
    title: "Я здесь — есть истории, которые хочется подарить",
    description:
      "Цифровая книга из ваших фотографий и слов. Получатель открывает её по ссылке с телефона.",
    locale: "ru_RU",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ru"
      className={`${cormorant.variable} ${inter.variable} ${marck.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F7F2E9] text-[#1F3042]">
        {children}
      </body>
    </html>
  );
}
