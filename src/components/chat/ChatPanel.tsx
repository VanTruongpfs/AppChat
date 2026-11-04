import type { ConversationData } from '../conversations/Conversation'
import ChatHeader from './ChatHeader'
import MessageList from './MessageList'
import MessageInput from './MessageInput'
import type { MessageData } from './types'
type ChatPanelProps = {
    conversation: ConversationData | null
    messages: MessageData[]
    onSendMessage: (text: string) => void
}
export default function ChatPanel({
                                      conversation,
                                      messages,
                                      onSendMessage
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
            <ChatHeader conversation={conversation} />
            <MessageList
                messages={messages}
                avatar={conversation.image}
                senderName={conversation.name}/>
            <MessageInput onSend={onSendMessage} />
        </div>
    )
}
