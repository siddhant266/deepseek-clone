import { Inder } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { AppContextProvider } from "@/context/AppContext";

// Fix: Specify the only available weight for Inder (400)
const inder = Inder({
  weight: "400", // ✅ Required for fonts with only one weight
  subsets: ["latin"],
  variable: "--font-inder",
  display: "swap", // Optional, improves performance
});

export const metadata = {
  title: "DeepSeek - Clone",
  description: "Next.js app",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <AppContextProvider>
        <html lang="en" className={inder.variable}>
          <body className={`${inder.className} antialiased`}>{children}</body>
        </html>
      </AppContextProvider>
    </ClerkProvider>
  );
}
