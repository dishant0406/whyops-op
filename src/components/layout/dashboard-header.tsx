"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

import { useAuthStore } from "@/stores/authStore";
import { UserDropdown } from "@/components/layout/user-dropdown";

const navItems = [
  { label: "Agents", href: "/agents" },
  { label: "Traces", href: "/traces" },
  { label: "Settings", href: "/settings" },
];

type DashboardHeaderProps = React.HTMLAttributes<HTMLDivElement>;

export function DashboardHeader({ className, ...props }: DashboardHeaderProps) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);

  return (
    <header
      className={cn(
        "flex h-14 items-center justify-between border-b border-border/50 bg-background px-6",
        className
      )}
      {...props}
    >
      <nav className="flex items-center gap-1.5">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(`${item.href}/`));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-sm border px-3 py-1.5 text-sm font-medium transition-colors",
                isActive
                  ? "border-border bg-card text-foreground"
                  : "border-transparent text-muted-foreground hover:border-border/60 hover:bg-surface-2/50 hover:text-foreground"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-3">
        <button
          className="grid h-8 w-8 place-items-center rounded-sm border border-transparent text-muted-foreground transition-colors hover:border-border/60 hover:bg-surface-2/50 hover:text-foreground"
          aria-label="Notifications"
        >
          <BellIcon />
        </button>
        <UserDropdown userEmail={user?.email} />
      </div>
    </header>
  );
}

function BellIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6.5 15C6.5 16.1046 7.39543 17 8.5 17C9.60457 17 10.5 16.1046 10.5 15M13.5 6C13.5 4.67392 12.9732 3.40215 12.0355 2.46447C11.0979 1.52678 9.82608 1 8.5 1C7.17392 1 5.90215 1.52678 4.96447 2.46447C4.02678 3.40215 3.5 4.67392 3.5 6C3.5 9.5 2 10.5 2 10.5H15C15 10.5 13.5 9.5 13.5 6Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
