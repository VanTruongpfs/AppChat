import { useEffect, useState } from 'react'
import type { ConversationData } from '../components/conversations/Conversation'
import { checkUserOnline } from '../services/chatService'

export function useUserOnlineStatus(selectedConversation: ConversationData | null) {
    const [onlineStatus, setOnlineStatus] = useState<boolean | null>(null)
    const [isCheckingOnline, setIsCheckingOnline] = useState(false)
    useEffect(() => {
        if (!selectedConversation || selectedConversation.isGroup) {
            setOnlineStatus(null)
            setIsCheckingOnline(false)
            return
        }
        let isMounted = true
        const userName = selectedConversation.name
        setOnlineStatus(null)
        setIsCheckingOnline(true)
        async function checkOnline() {
            try {
                const status = await checkUserOnline(userName)
                if (isMounted) {
                    setOnlineStatus(status)
                }
            } catch (error) {
                console.error("Lỗi kiểm tra trạng thái online:", error)
                if (isMounted) {
                    setOnlineStatus(null)
                }
            } finally {
                if (isMounted) {
                    setIsCheckingOnline(false)
                }
            }
        }
        void checkOnline()
        return () => {
            isMounted = false
        }
    }, [selectedConversation])

    return { onlineStatus, isCheckingOnline }
}
