import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Fintrak AI — Smart Budget Tracker",
    template: "%s | Fintrak AI",
  },
  description:
    "AI-powered personal finance tracker. Track income, expenses, budgets, and goals with intelligent insights.",
  keywords: [
    "budget tracker",
    "personal finance",
    "AI finance",
    "expense tracker",
    "money management",
  ],
  authors: [{ name: "Fintrak AI" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: "Fintrak AI — Smart Budget Tracker",
    description:
      "AI-powered personal finance tracker with intelligent insights.",
    siteName: "Fintrak AI",
  },
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.className} antialiased`}>
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
