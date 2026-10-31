import HeaderConversationList from '../../components/header/HeaderConversationList'
import ConversationList from '../../components/conversations/ConversationList'
import type { ConversationData } from '../../components/conversations/Conversation'
// @ts-ignore
import conversationImage from '../../assets/Screenshot 2026-10-30 121448.png'
import '../../styles/css/HomePage.scss'
import React from "react"
import ChatPanel from '../../components/chat/ChatPanel'
import type { MessageData } from '../../components/chat/types'
const conversations: ConversationData[] = [
    {
        id: 1,
        name: 'Nguyễn Gia Huy',
        image: conversationImage,
        lastMessage: 'Sticker',
        time: '3 phút',
        unreadCount: 2,
        isPriority: true,
        isGroup: false,
    },
    {
        id: 2,
        name: 'Lập trình FE',
        image: conversationImage,
        lastMessage: 'Bạn: Hay bạn',
        time: '13 phút',
        unreadCount: 5,
        isPriority: true,
        isGroup: true,
    },
    {
        id: 3,
        name: 'Vũ Nguyên',
        image: conversationImage,
        lastMessage: 'Hay bạn',
        time: '1 giờ',
        unreadCount: 0,
        isPriority: false,
        isGroup: false,
    },
]
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
    const [selectedConversation, setSelectedConversation] =
        React.useState<ConversationData | null>(conversations[0])
    const [messagesByConversation, setMessagesByConversation] =
        React.useState<Record<number, MessageData[]>>(mockMessages)
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
                    <HeaderConversationList />
                    <div className="conversation-croll">
                        <ConversationList
                            conversations={conversations}
                            selectedId={selectedConversation?.id ?? null}
                            onSelect={setSelectedConversation}
                        />
                    </div>
                </section>
                <section className="chat-panel">
                    <ChatPanel
                        conversation={selectedConversation}
                        messages={currentMessages}
                        onSendMessage={handleSendMessage}
                    />
                </section>
                <section className="details-panel"></section>
            </div>
        </>
    )
}
