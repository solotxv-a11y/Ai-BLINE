import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ai BLINE — AI Security & Learning Assistant",
  description:
    "Ai BLINE is a dark-neon AI assistant for cybersecurity learning, device protection and programming help. Chat with expert agents, train in the Pentest Academy and use a full security toolbox — on web and Android.",
  applicationName: "Ai BLINE",
  manifest: "/manifest.json",
  keywords: [
    "Ai BLINE",
    "AI assistant",
    "cybersecurity",
    "ethical hacking",
    "pentest academy",
    "security tools",
    "Next.js",
  ],
  authors: [{ name: "Ai BLINE" }],
  icons: {
    icon: "/icon-1024.png",
    apple: "/icon-1024.png",
  },
  openGraph: {
    title: "Ai BLINE — AI Security & Learning Assistant",
    description:
      "Chat with expert AI agents, learn legal & ethical penetration testing and use a full security toolbox.",
    siteName: "Ai BLINE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ai BLINE — AI Security & Learning Assistant",
    description:
      "Chat with expert AI agents, learn legal & ethical penetration testing and use a full security toolbox.",
  },
};

export const viewport: Viewport = {
  themeColor: "#04060b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

// Apply persisted appearance settings before paint to avoid flashes
const themeInit = `try{var s=JSON.parse(localStorage.getItem("aibline-ui")||"{}").state||{};var d=document.documentElement;if(s.accent)d.dataset.accent=s.accent;if(s.amoled)d.dataset.theme="amoled";if(s.reduceMotion)d.classList.add("reduce-motion")}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrains.variable} antialiased bg-background text-foreground font-sans overflow-hidden`}
      >
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
