'use client'
import { signOut } from 'next-auth/react'
import { useState } from 'react'
import { Loader2, LogOut } from 'lucide-react'

export const LogoutButton = (): React.JSX.Element => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const handleLogout = async (): Promise<void> => {
    setIsSubmitting(true)
    await signOut({ callbackUrl: '/' })
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isSubmitting}
      title={isSubmitting ? 'Déconnexion...' : 'Se déconnecter'}
      aria-label="Se déconnecter"
      className="grid size-9 shrink-0 place-items-center rounded-xl border border-gray-200 text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500 disabled:opacity-50 dark:border-white/[0.12] dark:text-gray-400 dark:hover:border-red-500/30 dark:hover:bg-red-500/10 dark:hover:text-red-400"
    >
      {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <LogOut className="size-4" />}
    </button>
  )
}
