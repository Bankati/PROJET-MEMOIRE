'use client'
import { useEffect } from 'react'
import { useNotifications } from '@/components/admin/layout-shell'

export const MarkMessagesRead = (): null => {
  const { markAllAsRead } = useNotifications()
  useEffect(() => {
    markAllAsRead()
  }, [markAllAsRead])
  return null
}
