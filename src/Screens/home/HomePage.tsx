import HeaderConversationList from '../../components/header/HeaderConversationList'
import ConversationList from '../../components/conversations/ConversationList'
import type { ConversationData } from '../../components/conversations/Conversation'
// @ts-ignore
import conversationImage from '../../assets/Screenshot 2026-10-30 121448.png'
import '../../styles/css/HomePage.scss'
import React from "react"

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
        lastMessage: 'Bạn: Mình gửi giao diện rồi nhé',
        time: '13 phút',
        unreadCount: 5,
        isPriority: true,
        isGroup: true,
    },
    {
        id: 3,
        name: 'Vũ Nguyên',
        image: conversationImage,
        lastMessage: 'Mai mình trao đổi tiếp nhé',
        time: '1 giờ',
        unreadCount: 0,
        isPriority: false,
        isGroup: false,
    },
]
export  default function HomePage(){
    return (
        <>
            <div className="home-page">
                <section className="conversation-sidebar">
                    <HeaderConversationList />
                    <div className="conversation-croll">
                        <ConversationList conversations={conversations}/>
                    </div>
                </section>
                <section className="chat-panel"></section>
                <section className="details-panel"></section>
            </div>
        </>
    )
}
