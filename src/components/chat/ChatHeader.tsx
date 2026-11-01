import type { ConversationData } from '../conversations/Conversation'
type ChatHeaderProps = {
    conversation: ConversationData
}
export default function ChatHeader({ conversation }: ChatHeaderProps) {
    return (
        <header className="chat-header">
            <div className="chat-header__user">
                <div className="chat-header__avatar-wrap">
                    <img
                        src={conversation.image}
                        alt={conversation.name}
                    />
                    <span className="chat-header__online-dot" />
                </div>
                <div className="chat-header__identity">
                    <h2>{conversation.name}</h2>
                    <span>Đang hoạt động</span>
                </div>
            </div>
            <div className="chat-header__actions">
                <button type="button" title="Tìm kiếm">
                    <i className="bi bi-search" />
                </button>
                <button type="button" title="Gọi thoại">
                    <i className="bi bi-telephone" />
                </button>
                <button type="button" title="Gọi video">
                    <i className="bi bi-camera-video" />
                </button>
                <button type="button" title="Tùy chọn">
                    <i className="bi bi-three-dots-vertical" />
                </button>
            </div>
        </header>
    )
}
