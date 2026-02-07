import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { OAuthButtons } from "@/components/auth/OAuthButtons";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  const { error, callbackUrl } = await searchParams;

  return (
    <Card className="w-full max-w-md animate-scale-in" variant="elevated" padding="lg">
      <CardHeader className="text-center border-0 pb-2">
        <CardTitle className="font-serif text-3xl">Welcome back</CardTitle>
        <CardDescription className="text-base text-[var(--text-secondary)]">
          Sign in to create AI-powered quizzes from your study materials
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {error === "AccessDenied" && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm text-center">
            Your account is not authorized to access this application.
          </div>
        )}
        <OAuthButtons callbackUrl={callbackUrl} />
        <p className="text-xs text-center text-[var(--text-tertiary)] mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </CardContent>
    </Card>
  );
}
