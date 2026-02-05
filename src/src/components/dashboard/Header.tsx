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
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          {title && (
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {title}
            </h1>
          )}
          {description && (
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              {description}
            </p>
          )}
        </div>

        {/* User info */}
        <div className="flex items-center gap-3">
          {session?.user && (
            <>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {session.user.name || "User"}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {session.user.email}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center overflow-hidden">
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={20} className="text-primary-600" />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
