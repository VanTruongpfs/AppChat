import HeaderConversationList from '../header/HeaderConversationList'
import ConversationList from './ConversationList'
import type { ConversationData } from './Conversation'

type ConversationSidebarProps = {
    conversations: ConversationData[]
    selectedConversationId: string | null
    isLoadingConversations: boolean
    conversationsError: string
    currentUser: string | null
    isLoggingOut: boolean
    onSelect: (conversation: ConversationData) => void
    onCreateRoom: () => void
    onLogout: () => void
}

export default function ConversationSidebar({
    conversations,
    selectedConversationId,
    isLoadingConversations,
    conversationsError,
    currentUser,
    isLoggingOut,
    onSelect,
    onCreateRoom,
    onLogout,
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
            <footer className="sidebar-user-footer">
                <div className="sidebar-user-info" title={currentUser ?? ''}>
                    <span className="sidebar-user-avatar" aria-hidden="true">
                        <i className="bi bi-person-fill" />
                    </span>
                    <span className="sidebar-user-name">
                        {currentUser ?? 'Người dùng'}
                    </span>
                </div>
                <button
                    type="button"
                    className="sidebar-logout-btn"
                    onClick={onLogout}
                    disabled={isLoggingOut}
                    aria-label="Đăng xuất"
                    title="Đăng xuất"
                >
                    <i className="bi bi-box-arrow-right" aria-hidden="true" />
                    <span>{isLoggingOut ? 'Đang thoát...' : 'Đăng xuất'}</span>
                </button>
            </footer>
        </section>
    )
}
