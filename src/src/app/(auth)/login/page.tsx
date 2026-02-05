import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { OAuthButtons } from "@/components/auth/OAuthButtons";

export default async function LoginPage() {
  const session = await auth();

  // Redirect to dashboard if already logged in
  if (session) {
    redirect("/dashboard");
  }

  return (
    <Card className="w-full max-w-md" padding="lg">
      <CardHeader className="text-center border-0 pb-2">
        <CardTitle className="text-2xl">Welcome to QuizAI</CardTitle>
        <CardDescription className="text-base">
          Sign in to create AI-powered quizzes from your study materials
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <OAuthButtons />
        <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </CardContent>
    </Card>
  );
}
