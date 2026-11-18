import HeaderConversationList from '../header/HeaderConversationList'
import ConversationList from './ConversationList'
import type { ConversationData } from './Conversation'

type ConversationSidebarProps = {
    conversations: ConversationData[]
    selectedConversationId: string | null
    isLoadingConversations: boolean
    conversationsError: string
    onSelect: (conversation: ConversationData) => void
    onCreateRoom: () => void
}

export default function ConversationSidebar({
    conversations,
    selectedConversationId,
    isLoadingConversations,
    conversationsError,
    onSelect,
    onCreateRoom,
}: ConversationSidebarProps) {
    return (
        <section className="conversation-sidebar">
            <HeaderConversationList
                onCreateRoom={onCreateRoom}
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
                        selectedId={selectedConversationId}
                        onSelect={onSelect}
                    />
                )}
            </div>
        </section>
    )
}
