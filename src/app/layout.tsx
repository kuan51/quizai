import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import "./globals.css";

export const metadata: Metadata = {
  title: "QuizAI - AI-Powered Study Quiz Generator",
  description:
    "Generate AI-powered quizzes from your study materials to help you prepare for exams and finals.",
  keywords: ["quiz", "AI", "study", "education", "learning", "exam prep"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50 dark:bg-slate-950 font-sans">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
