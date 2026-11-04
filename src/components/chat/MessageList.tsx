
import { useEffect, useRef } from 'react'
import MessageItem from './MessageItem'
import type { MessageData } from './types'
type MessageListProps = {
    messages: MessageData[]
    avatar: string
    senderName: string
}
export default function MessageList({
                                        messages,
                                        avatar,
                                        senderName
                                    }: MessageListProps) {
    const bottomRef = useRef<HTMLDivElement>(null)
    useEffect(() => {
        bottomRef.current?.scrollIntoView({
            behavior: 'smooth'
        })
    }, [messages])
    return (
        <div className="message-list">
            <div className="message-list__date">
                <span>Hôm nay</span>
            </div>
            {messages.map((message) => (
                <MessageItem
                    key={message.id}
                    message={message}
                    avatar={avatar}
                    senderName={senderName}
                />
            ))}
            <div ref={bottomRef} />
        </div>
    )
}
