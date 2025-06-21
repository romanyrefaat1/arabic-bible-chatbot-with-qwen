import "./(preview)/globals.css";
import { Metadata } from "next";
import { Toaster } from "sonner";


import { Cairo, Tajawal } from 'next/font/google';
import { VersesProvider } from "@/contexts/verses-contexts";

const font = Cairo({
  subsets: ['arabic'],
  weight: ['400', '700'], // Choose the weights you need
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ai-sdk-preview-rsc-genui.vercel.dev"),
  title: "Generative User Interfaces Preview",
  description: "Generative UI with React Server Components and Vercel AI SDK",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body dir="rtl" className={font.className}>
        <Toaster position="top-center" richColors />
        <VersesProvider>
        {children}
        </VersesProvider>
      </body>
    </html>
  );
}