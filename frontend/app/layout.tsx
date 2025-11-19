import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Praxos - AI-Generated ERC-4626 Vaults",
  description: "AI-powered vault generation for Real-World Asset tokenization",
  icons: {
    icon: '/praxos_favicon.jpeg',
    apple: '/praxos_favicon.jpeg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/praxos_favicon.jpeg" />
        <link rel="apple-touch-icon" href="/praxos_favicon.jpeg" />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
