import { useEffect } from 'react'
import { useAppDispatch } from '../app/hook'
import type { ConversationData } from '../components/conversations/Conversation'
import { setConversations, setConversationLoading, setConversationError } from '../components/conversations/conversationSlice'
import { getUserList } from '../services/chatService'
import { getConversationId } from '../utils/conversationId'
// @ts-ignore
import conversationImage from '../assets/Screenshot 2026-10-30 121448.png'

export function useLoadConversations() {
    const dispatch = useAppDispatch()
    useEffect(() => {
        let isMounted = true
        async function fetchConversations() {
            try {
                dispatch(setConversationLoading(true))
                dispatch(setConversationError(""))
                const userList = await getUserList()
                const formattedConversations: ConversationData[] =
                    userList.map((item) => {
                        const actionDate = new Date(
                            item.actionTime.replace(" ", "T")
                        )
                        const formattedTime = isNaN(actionDate.getTime())
                            ? item.actionTime
                            : actionDate.toLocaleString("vi-VN", {
                                day: "2-digit",
                                month: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                            })
                        return {
                            id: getConversationId(item.name, item.type ===1),
                            name: item.name,
                            image: conversationImage,
                            lastMessage: item.type === 1
                                ? "Phòng chat"
                                : "Cuộc trò chuyện",
                            time: formattedTime,
                            unreadCount: 0,
                            isPriority: false,
                            isGroup: item.type === 1,
                        }
                    })
                if (isMounted) {
                    dispatch(setConversations(formattedConversations))
                }
            } catch (err) {
                if (isMounted) {
                    dispatch(setConversationError(
                        err instanceof Error
                            ? err.message
                            : "Không thể tải danh sách hội thoại."
                    ))
                }
            } finally {
                if (isMounted) {
                    dispatch(setConversationLoading(false))
                }
            }
        }
        void fetchConversations()
        return () => {
            isMounted = false
        }
    }, [dispatch])
}
