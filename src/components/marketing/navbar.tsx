/**
 * Barre de navigation marketing premium : logo, liens de section et CTA.
 * Glassmorphism avancé avec apparition en slide-down et effet de blur progressif.
 */
"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeSwitch } from "@/components/ui/theme-switch-button";
import { cn } from "@/lib/utils";

type NavLink = Readonly<{
  label: string;
  href: string;
}>;

const navLinks: readonly NavLink[] = [
  { label: "Fonctionnalités", href: "#fonctionnalites" },
  { label: "Pour qui ?", href: "#pour-qui" },
  { label: "Avantages", href: "#avantages" },
  { label: "Démo", href: "#demo" },
] as const;

export function Navbar() {
  const reduce = useReducedMotion();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { scrollY } = useScroll();
  const bgOpacity = useTransform(scrollY, [0, 80], [0.55, 0.88]);
  const borderOpacity = useTransform(scrollY, [0, 80], [0, 0.7]);
  return (
    <>
      <motion.header
        initial={reduce ? false : { y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 32, delay: 0.1 }}
        className="fixed top-0 right-0 left-0 z-50"
      >
        <motion.div
          className="absolute inset-0 backdrop-blur-xl"
          style={{ opacity: bgOpacity }}
        >
          <div className="absolute inset-0 bg-white/80 dark:bg-zinc-950/80" />
        </motion.div>
        <motion.div
          className="absolute inset-x-0 bottom-0 h-px bg-zinc-200/70 dark:bg-zinc-800/70"
          style={{ opacity: borderOpacity }}
        />
        <nav className="relative mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link
            href="/"
            aria-label="LBS Call Center — accueil"
            className="group flex items-center gap-3"
          >
            <motion.div
              whileHover={reduce ? undefined : { scale: 1.05 }}
              whileTap={reduce ? undefined : { scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
            >
              <Image
                src="/LBS%20LOGO.jpeg"
                alt="Lomé Business School — LBS Call Center"
                width={56}
                height={56}
                className="rounded-lg border border-zinc-200/70 object-cover transition-shadow group-hover:shadow-md group-hover:shadow-lbs-blue/15 dark:border-zinc-800/70"
                priority
              />
            </motion.div>
            <span className="hidden text-sm font-semibold tracking-tight text-zinc-900 dark:text-white sm:inline">
              LBS Call Center
            </span>
          </Link>
          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100/80 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <ThemeSwitch />
            <motion.div
              whileHover={reduce ? undefined : { scale: 1.03 }}
              whileTap={reduce ? undefined : { scale: 0.97 }}
            >
              <Button asChild size="sm">
                <Link href="/login">Connexion</Link>
              </Button>
            </motion.div>
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="grid size-9 place-items-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 md:hidden"
              aria-label="Menu mobile"
            >
              {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </nav>
      </motion.header>
      {mobileOpen && (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="fixed inset-x-0 top-[56px] z-40 border-b border-zinc-200/70 bg-white/95 p-4 backdrop-blur-xl dark:border-zinc-800/70 dark:bg-zinc-950/95 md:hidden"
        >
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "rounded-xl px-4 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800/60",
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </>
  );
}
