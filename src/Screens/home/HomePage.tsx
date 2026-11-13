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
import { getUserList, getChatMessages,checkUserOnline } from '../../services/chatService'
import { useAppDispatch, useAppSelector } from '../../app/hook'
import { setError, setMessages, setHasMore, setLoading, setPage, appendMessages, prependMessages } from '../../components/chat/ChatSlice'
import CreateRoomModal from '../../components/popupCreateGroup/CreateRoomModal'

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
    const [showCreateRoom, setShowCreateRoom] = React.useState(false)
    const [onlineStatus, setOnlineStatus] = React.useState<boolean | null>(null)
    const [isCheckingOnline, setIsCheckingOnline] = React.useState(false)
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
                const result = await getChatMessages(selectedConversation.name, 1)
                if (isMounted) {
                    const messages: MessageData[] = result.messages
                        .map((m) => ({
                            id: m.id,
                            text: m.mes,
                            time: m.createdAt ? new Date(m.createdAt.replace(" ", "T")).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "",
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
    React.useEffect(() => {
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
            const result = await getChatMessages(selectedConversation.name, currentPage + 1)
            const messages: MessageData[] = result.messages
                .map((m) => ({
                    id: m.id,
                    text: m.mes,
                    time: m.createdAt ? new Date(m.createdAt.replace(" ", "T")).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "",
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
    return (
        <>
            <div className="home-page">
                <section className="conversation-sidebar">
                    <HeaderConversationList
                        onCreateRoom={() => setShowCreateRoom(true)}
                    />
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
                        isOnline={onlineStatus}
                        isCheckingOnline={isCheckingOnline}
                    />
                </section>
                <section className="details-panel">
                    <DetailPanel conversation={selectedConversation} />
                </section>
            </div>
            {showCreateRoom && (
                <CreateRoomModal
                    friends={conversations
                        .filter(item => !item.isGroup)
                        .map(item => ({
                            name: item.name,
                            image: item.image,
                        }))}
                    onClose={() => setShowCreateRoom(false)}
                    onConfirm={data => {
                        console.log("Dữ liệu tạo nhóm:", data)
                    }}
                />
            )}
        </>
    )
}