'use client'
import { useEffect } from 'react'
import { useAgentNotifications } from '@/components/agent/layout-shell'

export const MarkAgentMessagesRead = (): null => {
  const { markAllAsRead } = useAgentNotifications()
  useEffect(() => {
    markAllAsRead()
  }, [markAllAsRead])
  return null
}
