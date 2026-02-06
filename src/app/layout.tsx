import type { Metadata } from "next";
import { Instrument_Serif, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import "./globals.css";

const serif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
});

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "QuizAI - AI-Powered Study Quiz Generator",
  description:
    "Generate AI-powered quizzes from your study materials to help you prepare for exams and finals.",
  keywords: ["quiz", "AI", "study", "education", "learning", "exam prep"],
};

const THEME_INIT_SCRIPT = `(function(){try{var e=document.documentElement;var t=localStorage.getItem("quizai-theme");var v=["editorial-dark","editorial-neon","cyberpunk-light","cyberpunk-dark","cyberpunk-neon","dracula-light","dracula-dark","dracula-neon","arc-light","arc-dark","arc-neon","glass-light","glass-dark","glass-neon"];var d=["editorial-dark","editorial-neon","cyberpunk-dark","cyberpunk-neon","dracula-dark","dracula-neon","arc-dark","arc-neon","glass-dark","glass-neon"];if(t&&v.indexOf(t)!==-1){e.dataset.theme=t;if(d.indexOf(t)!==-1){e.classList.add("dark");e.style.colorScheme="dark";}else{e.classList.remove("dark");e.style.colorScheme="light";}}else{localStorage.removeItem("quizai-theme");delete e.dataset.theme;e.classList.remove("dark");e.style.colorScheme="light";}}catch(x){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${serif.variable} ${sans.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="antialiased font-sans">
        <SessionProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
