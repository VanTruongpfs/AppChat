import { useEffect, useRef } from 'react'
import MessageItem from './MessageItem'
import type { MessageData } from './types'
type MessageListProps = {
    messages: MessageData[]
    avatar: string
    senderName: string
    onLoadMore?: () => void
    isLoadingMore?: boolean
    hasMore?: boolean
}
export default function MessageList({
    messages,
    avatar,
    senderName,
    onLoadMore,
    isLoadingMore,
    hasMore,
}: MessageListProps) {
    const bottomRef = useRef<HTMLDivElement>(null)
    const topRef = useRef<HTMLDivElement>(null)
    const listRef = useRef<HTMLDivElement>(null)
    const rafRef = useRef<number | null>(null)

    useEffect(() => {
        const list = listRef.current
        if (!list || isLoadingMore) return
        const isAtBottom =
            list.scrollHeight - list.scrollTop <= list.clientHeight + 20
        if (isAtBottom) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messages, isLoadingMore])

    useEffect(() => {
        const list = listRef.current
        if (!list) return
        const scrollTopBefore = list.scrollTop
        const heightBefore = list.scrollHeight
        rafRef.current = requestAnimationFrame(() => {
            rafRef.current = null
            const current = listRef.current
            if (!current) return
            const heightAfter = current.scrollHeight
            if (heightAfter > heightBefore) {
                current.scrollTop = scrollTopBefore + (heightAfter - heightBefore)
            }
        })
        return () => {
            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current)
                rafRef.current = null
            }
        }
    }, [messages])

    
    useEffect(() => {
        if (!onLoadMore || !hasMore) return
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !isLoadingMore && messages.length > 0) {
                    onLoadMore()
                }
            },
            { threshold: 0.1 }
        )
        if (topRef.current) observer.observe(topRef.current)
        return () => observer.disconnect()
    }, [onLoadMore, hasMore, isLoadingMore, messages.length])

    return (
        <div className="message-list" ref={listRef}>
            {isLoadingMore && hasMore && (
                <div className="message-list__top-loader">Đang tải thêm...</div>
            )}
            <div ref={topRef} />
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
