import type { ConversationData } from '../conversations/Conversation'
import ChatHeader from './ChatHeader'
import MessageList from './MessageList'
import MessageInput from './MessageInput'
import type { MessageData } from './types'
type ChatPanelProps = {
    conversation: ConversationData | null
    messages: MessageData[]
    onSendMessage: (text: string) => void
    onLoadMore?: () => void
    isLoadingMore?: boolean
    hasMore?: boolean
    error?: string
    isOnline: boolean | null
    isCheckingOnline: boolean | null
}
export default function ChatPanel({
                                      conversation,
                                      messages,
                                      onSendMessage,
                                      onLoadMore,
                                      isLoadingMore,
                                      hasMore,
                                      error,
                                      isOnline,
                                      isCheckingOnline,
                                  }: ChatPanelProps) {
    if (!conversation) {
        return (
            <div className="chat-empty-state">
                <div className="chat-empty-state__icon">
                    <i className="bi bi-chat-square-dots" />
                </div>
                <h2>Chào mừng đến với AppChat</h2>
                <p>Chọn một cuộc trò chuyện để bắt đầu nhắn tin.</p>
            </div>
        )
    }
    return (
        <div className="chat-panel__content">
            {error && (
                <div className="chat-error">{error}</div>
            )}
            <ChatHeader
                conversation={conversation}
                isOnline={isOnline}
                isCheckingOnline={isCheckingOnline}
            />
            <MessageList
                messages={messages}
                avatar={conversation.image}
                senderName={conversation.name}
                onLoadMore={onLoadMore}
                isLoadingMore={isLoadingMore}
                hasMore={hasMore}
            />
            <MessageInput onSend={onSendMessage} />
        </div>
    )
}
