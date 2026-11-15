
import type { ConversationData } from '../conversations/Conversation'
type ChatHeaderProps = {
    conversation: ConversationData
    isOnline: boolean | null
    isCheckingOnline: boolean
}
export default function ChatHeader({
                                       conversation,
                                       isOnline,
                                       isCheckingOnline,
                                   }: ChatHeaderProps) {
    const statusText = conversation.isGroup
        ? "Phòng chat nhóm"
        : isCheckingOnline
            ? "Đang kiểm tra..."
            : isOnline === null
                ? "Không xác định"
                : isOnline
                    ? "Đang hoạt động"
                    : "Không hoạt động"
    const statusClass = isCheckingOnline
        ? "is-checking"
        : isOnline === true
            ? "is-online"
            : isOnline === false
                ? "is-offline"
                : "is-unknown"

    return (
        <header className="chat-header">
            <div className="chat-header__user">
                <div className="chat-header__avatar-wrap">
                    <img
                        src={conversation.image}
                        alt={conversation.name}
                    />
                    {!conversation.isGroup && (
                        <span
                            className={`chat-header__online-dot ${statusClass}`}
                        />
                    )}
                </div>
                <div className="chat-header__identity">
                    <h2>{conversation.name}</h2>
                    <span>{statusText}</span>
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
