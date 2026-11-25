import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../app/hook'
import type { ConversationData } from '../components/conversations/Conversation'
import type { MessageData } from '../components/chat/types'
import { setError, setMessages, setHasMore, setLoading, setPage, appendMessages, prependMessages } from '../components/chat/ChatSlice'
import { getChatMessages } from '../services/chatService'
import { sendChatMessage } from '../services/sendChatService'
import {decodeEmoji} from '../utils/emojiCode'

export function useChatMessages(
    selectedConversation: ConversationData | null,
    authUser: string | null
) {
    const dispatch = useAppDispatch()
    const {
        messagesByConversation,
        pageByConversation,
        hasMoreByConversation,
        loadingByConversation,
        errorByConversation,
    } = useAppSelector(state => state.chat)
    useEffect(() => {
        if (!selectedConversation) return
        let isMounted = true
        const id = selectedConversation.id
        dispatch(setError({ conversationId: id, error: "" }))
        dispatch(setLoading({ conversationId: id, loading: true }))
        dispatch(setPage({ conversationId: id, page: 1 }))

        async function loadHistory() {
            if (!selectedConversation) return
            try {
                const result = await getChatMessages(selectedConversation.name, 1, selectedConversation.isGroup)
                if (isMounted) {
                    const messages: MessageData[] = result.messages
                        .map((m) => ({
                            id: m.id,
                            text: decodeEmoji(m.mes),
                            time: m.createAt ? new Date(m.createAt.replace(" ", "T")).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "",
                            isMine: m.name === authUser,
                            type: "text" as const,
                        }))
                        .sort((a, b) => a.id - b.id)
                    dispatch(setMessages({ conversationId: id, messages }))
                    dispatch(setHasMore({ conversationId: id, hasMore: result.hasMore }))
                    dispatch(setLoading({ conversationId: id, loading: false }))
                }
            } catch (err) {
                if (isMounted) {
                    dispatch(setError({ conversationId: id, error: err instanceof Error ? err.message : "Không tải được tin nhắn." }))
                    dispatch(setLoading({ conversationId: id, loading: false }))
                }
            }
        }
        void loadHistory()
        return () => {
            isMounted = false
        }
    }, [selectedConversation, authUser, dispatch])
    const currentMessages = selectedConversation
        ? messagesByConversation[selectedConversation.id] || []
        : []
    const currentError = selectedConversation ? errorByConversation[selectedConversation.id] : ""
    const currentLoading = selectedConversation ? loadingByConversation[selectedConversation.id] : false
    const currentHasMore = selectedConversation ? hasMoreByConversation[selectedConversation.id] : false

    const handleSendMessage = async (text: string) => {
        const conversation = selectedConversation;
        const content = text.trim();

        if (!conversation || !content) return

        const conversationId = conversation.id
        dispatch(setError({conversationId,error:""}))
        try {
            await sendChatMessage(conversation.name, content, conversation.isGroup);
            const newMessage: MessageData = {
                id: Date.now(),
                text,
                time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                isMine: true,
                type: 'text',
            }
            dispatch(appendMessages({ conversationId, messages: [newMessage] }))
        }catch (error) {
            dispatch(setError({conversationId, error: error instanceof Error ? error.message : "Không gửi được tin nhắn"}))
        }

    }

    const handleLoadMore = async () => {
        if (!selectedConversation) return
        const conversationId = selectedConversation.id
        const currentPage = pageByConversation[conversationId] ?? 1
        if (!currentHasMore || currentLoading) return

        dispatch(setLoading({ conversationId, loading: true }))
        try {
            const result = await getChatMessages(selectedConversation.name, currentPage + 1, selectedConversation.isGroup)
            const messages: MessageData[] = result.messages
                .map((m) => ({
                    id: m.id,
                    text: decodeEmoji(m.mes),
                    time: m.createAt ? new Date(m.createAt.replace(" ", "T")).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "",
                    isMine: m.name === authUser,
                    type: "text" as const,
                }))
                .sort((a, b) => a.id - b.id)
            if (messages.length > 0) {
                dispatch(prependMessages({ conversationId, messages }))
                dispatch(setPage({ conversationId, page: currentPage + 1 }))
            }
            dispatch(setHasMore({ conversationId, hasMore: result.hasMore }))
            dispatch(setLoading({ conversationId, loading: false }))
        } catch (err) {
            dispatch(setLoading({ conversationId, loading: false }))
            dispatch(setError({ conversationId, error: err instanceof Error ? err.message : "Lỗi tải thêm tin nhắn." }))
        }
    }

    return {
        currentMessages,
        currentError,
        currentLoading,
        currentHasMore,
        handleSendMessage,
        handleLoadMore,
    }
}
