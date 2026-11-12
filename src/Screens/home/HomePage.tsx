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
import CreateRoomModal from '../../components/popupCreateGroup/CreateRoomModal'
const mockMessages: Record<number, MessageData[]> = {
    1: [
        {
            id: 1,
            text: 'Con vợ làm gì đấy?',
            time: '15:30',
            isMine: false,
            type: 'text',
        },
        {
            id: 2,
            text: 'Đang vibe giao diện bạn ơi.',
            time: '15:31',
            isMine: true,
            type: 'text',
        },
        {
            id: 3,
            text: 'Tới đâu rồi ní?',
            time: '15:32',
            isMine: false,
            type: 'text',
        },
        {
            id: 4,
            text: 'T đang làm phần Chat Panel nè.',
            time: '15:33',
            isMine: true,
            type: 'text',
        },
    ],
    2: [
        {
            id: 1,
            text: 'Làm xong chưa ae?',
            time: '14:20',
            isMine: false,
            type: 'text',
        },
        {
            id: 2,
            text: 'Chưa m ơi bận nhắn với Thuỷ Linh rồi.',
            time: '14:25',
            isMine: true,
            type: 'text',
        },
    ],
    3: [
        {
            id: 1,
            text: 'Hay bạn.',
            time: '14:00',
            isMine: false,
            type: 'text',
        },
    ],
}
export default function HomePage() {
    const [conversations, setConversations] =
        React.useState<ConversationData[]>([])
    const [selectedConversation, setSelectedConversation] =
        React.useState<ConversationData | null>(null)
    const [messagesByConversation, setMessagesByConversation] =
        React.useState<Record<number, MessageData[]>>(mockMessages)
    const [isLoading, setIsLoading] = React.useState(true)
    const [error, setError] = React.useState("")
    const [showCreateRoom, setShowCreateRoom] = React.useState(false)
    // const groupCount = conversations.filter(item => item.isGroup).length
    // const personalCount = conversations.filter(item => !item.isGroup).length
    React.useEffect(() => {
        let isMounted = true
        async function fetchConversations() {
            try {
                setIsLoading(true)
                setError("")
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
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Không thể tải danh sách hội thoại."
                    )
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false)
                }
            }
        }
        void fetchConversations()
        return () => {
            isMounted = false
        }
    }, [])
    const currentMessages = selectedConversation
        ? messagesByConversation[selectedConversation.id] || []
        : []
    const handleSendMessage = (text: string) => {
        if (!selectedConversation) return
        const conversationId = selectedConversation.id
        const newMessage: MessageData = {
            id: Date.now(),
            text: text,
            time: new Date().toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
            }),
            isMine: true,
            type: 'text',
        }
        setMessagesByConversation(previous => ({
            ...previous,
            [conversationId]: [
                ...(previous[conversationId] || []),
                newMessage,
            ],
        }))
    }
    return (
        <>
            <div className="home-page">
                <section className="conversation-sidebar">
                    <HeaderConversationList
                        onCreateRoom={() => setShowCreateRoom(true)}
                    />
                    <div className="conversation-croll">
                        {isLoading && (
                            <p>Đang tải danh sách hội thoại...</p>
                        )}
                        {error && (
                            <p className="conversation-error">
                                {error}
                            </p>
                        )}
                        {!isLoading && !error && conversations.length === 0 && (
                            <p>Chưa có cuộc trò chuyện nào.</p>
                        )}
                        {!isLoading && !error && (
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