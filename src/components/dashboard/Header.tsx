"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";
import { User } from "lucide-react";

interface HeaderProps {
  title?: string;
  description?: string;
}

export function Header({ title, description }: HeaderProps) {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-40 bg-[var(--surface)] border-b border-[var(--border-subtle)] px-6 py-4 animate-fade-down">
      <div className="flex items-center justify-between">
        <div>
          {title && (
            <h1 className="font-serif text-2xl text-[var(--text-primary)]">
              {title}
            </h1>
          )}
          {description && (
            <p className="text-[var(--text-secondary)] mt-1">{description}</p>
          )}
        </div>

        {/* User info */}
        <div className="flex items-center gap-3">
          {session?.user && (
            <>
              <div className="text-right hidden sm:block">
                <p className="font-medium text-sm text-[var(--text-primary)]">
                  {session.user.name || "User"}
                </p>
                <p className="font-mono text-[11px] text-[var(--text-tertiary)]">
                  {session.user.email}
                </p>
              </div>
              <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900 border border-[var(--border-subtle)] flex items-center justify-center overflow-hidden">
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    width={36}
                    height={36}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={18} className="text-primary-600" />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
