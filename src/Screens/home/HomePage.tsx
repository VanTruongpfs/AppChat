import HeaderConversationList from '../../components/header/HeaderConversationList'
import ConversationList from '../../components/conversations/ConversationList'
import type { ConversationData } from '../../components/conversations/Conversation'
// @ts-ignore
import conversationImage from '../../assets/Screenshot 2026-10-30 121448.png'
import '../../styles/css/HomePage.scss'
import React from "react"
import ChatPanel from '../../components/chat/ChatPanel'
import DetailPanel from '../../components/DetailPanel/DetailPanel'
import type { MessageData } from '../../components/chat/types'
import { getUserList } from '../../services/chatService'
import { connectChatSocket } from '../../services/connectSocket'
import { useAppDispatch, useAppSelector } from '../../app/hook'
import { setError, setMessages, setHasMore, setLoading, setPage, appendMessages, prependMessages } from '../../components/chat/ChatSlice'

async function fetchRoomMessages(name: string, page: number, authUser: string | null): Promise<{ messages: any[]; hasMore: boolean }> {
    const ws = await connectChatSocket()
    return new Promise((resolve, reject) => {
        const timer = window.setTimeout(() => {
            cleanup()
            reject(new Error("Server không phản hồi CHAT_PEOPLE_GET_MES."))
        }, 10000)
        function cleanup() {
            window.clearTimeout(timer)
            ws.removeEventListener("message", handleMessage)
            ws.removeEventListener("close", handleClose)
            ws.removeEventListener("error", handleError)
        }
        function handleMessage(event: MessageEvent) {
            let response: any
            try { response = JSON.parse(event.data) } catch { return }
            if (response.status === "error") {
                cleanup()
                reject(new Error(response.mes || "Phòng không tồn tại hoặc bạn không trong phòng."))
                return
            }
            if (response.event !== "CHAT_PEOPLE_GET_MES") return
            cleanup()
            const data = response.data
            let serverMessages: any[] = []
            if (Array.isArray(data)) {
                serverMessages = data
            } else if (data && Array.isArray(data.chatMess)) {
                serverMessages = data.chatMess
            } else {
                cleanup()
                reject(new Error("Định dạng phản hồi không hợp lệ."))
                return
            }
            const messages = serverMessages
                .map((m) => ({
                    id: m.id,
                    text: m.mes,
                    time: m.createdAt ? new Date(m.createdAt.replace(" ", "T")).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "",
                    isMine: m.name === authUser,
                    type: "text" as const,
                }))
                .sort((a, b) => a.id - b.id)
            resolve({ messages, hasMore: serverMessages.length === 50 })
        }
        function handleClose() { cleanup(); reject(new Error("WebSocket đã bị đóng.")) }
        function handleError() { cleanup(); reject(new Error("Lỗi kết nối WebSocket.")) }
        ws.addEventListener("message", handleMessage)
        ws.addEventListener("close", handleClose)
        ws.addEventListener("error", handleError)
        ws.send(JSON.stringify({
            action: "onchat",
            data: { event: "CHAT_PEOPLE_GET_MES", data: { name, page } }
        }))
    })
}

export default function HomePage() {
    const dispatch = useAppDispatch()
    const authUser = useAppSelector(state => state.auth.user)
    const {
        messagesByConversation,
        pageByConversation,
        hasMoreByConversation,
        loadingByConversation,
        errorByConversation,
    } = useAppSelector(state => state.chat)
    const [conversations, setConversations] =
        React.useState<ConversationData[]>([])
    const [selectedConversation, setSelectedConversation] =
        React.useState<ConversationData | null>(null)
    const [isLoadingConversations, setIsLoadingConversations] =
        React.useState(true)
    const [conversationsError, setConversationsError] = React.useState("")
    // const groupCount = conversations.filter(item => item.isGroup).length
    // const personalCount = conversations.filter(item => !item.isGroup).length
    React.useEffect(() => {
        let isMounted = true
        async function fetchConversations() {
            try {
                setIsLoadingConversations(true)
                setConversationsError("")
                const userList = await getUserList()
                const formattedConversations: ConversationData[] =
                    userList.map((item, index) => {
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
                            id: index + 1,
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
                    setConversations(formattedConversations)
                    setSelectedConversation(
                        formattedConversations[0] ?? null
                    )
                }
            } catch (err) {
                if (isMounted) {
                    setConversationsError(
                        err instanceof Error
                            ? err.message
                            : "Không thể tải danh sách hội thoại."
                    )
                }
            } finally {
                if (isMounted) {
                    setIsLoadingConversations(false)
                }
            }
        }
        void fetchConversations()
        return () => {
            isMounted = false
        }
    }, [])
    React.useEffect(() => {
        if (!selectedConversation) return
        let isMounted = true
        const id = selectedConversation.id
        dispatch(setError({ conversationId: id, error: "" }))
        dispatch(setLoading({ conversationId: id, loading: true }))
        dispatch(setPage({ conversationId: id, page: 1 }))

        async function loadHistory() {
            if (!selectedConversation) return
            try {
                const result = await fetchRoomMessages(selectedConversation.name, 1, authUser)
                if (isMounted) {
                    dispatch(setMessages({ conversationId: id, messages: result.messages }))
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

    const handleSendMessage = (text: string) => {
        if (!selectedConversation) return
        const conversationId = selectedConversation.id
        const newMessage: MessageData = {
            id: Date.now(),
            text,
            time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            isMine: true,
            type: 'text',
        }
        dispatch(appendMessages({ conversationId, messages: [newMessage] }))
    }

    const handleLoadMore = async () => {
        if (!selectedConversation) return
        const conversationId = selectedConversation.id
        const currentPage = pageByConversation[conversationId] ?? 1
        if (!currentHasMore || currentLoading) return

        dispatch(setLoading({ conversationId, loading: true }))
        try {
            const result = await fetchRoomMessages(selectedConversation.name, currentPage + 1, authUser)
            if (result.messages.length > 0) {
                dispatch(prependMessages({ conversationId, messages: result.messages }))
                dispatch(setPage({ conversationId, page: currentPage + 1 }))
            }
            dispatch(setHasMore({ conversationId, hasMore: result.hasMore }))
            dispatch(setLoading({ conversationId, loading: false }))
        } catch (err) {
            dispatch(setLoading({ conversationId, loading: false }))
            dispatch(setError({ conversationId, error: err instanceof Error ? err.message : "Lỗi tải thêm tin nhắn." }))
        }
    }
    return (
        <>
            <div className="home-page">
                <section className="conversation-sidebar">
                    <HeaderConversationList />
                    <div className="conversation-croll">
                        {isLoadingConversations && (
                            <p>Đang tải danh sách hội thoại...</p>
                        )}
                        {conversationsError && (
                            <p className="conversation-error">
                                {conversationsError}
                            </p>
                        )}
                        {!isLoadingConversations && !conversationsError && conversations.length === 0 && (
                            <p>Chưa có cuộc trò chuyện nào.</p>
                        )}
                        {!isLoadingConversations && !conversationsError && (
                            <ConversationList
                                conversations={conversations}
                                selectedId={selectedConversation?.id ?? null}
                                onSelect={setSelectedConversation}
                            />
                        )}
                    </div>
                </section>
                <section className="chat-panel">
                    <ChatPanel
                        conversation={selectedConversation}
                        messages={currentMessages}
                        onSendMessage={handleSendMessage}
                        onLoadMore={handleLoadMore}
                        isLoadingMore={currentLoading}
                        hasMore={currentHasMore}
                        error={currentError}
                    />
                </section>
                <section className="details-panel">
                    <DetailPanel conversation={selectedConversation} />
                </section>
            </div>
        </>
    )
}