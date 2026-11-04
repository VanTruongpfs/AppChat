import type { ConversationData } from '../conversations/Conversation'

type DetailPanelProps = {
    conversation: ConversationData | null
}

const DetailPanel = ({ conversation }: DetailPanelProps) => {
    if (!conversation) {
        return (
            <div className="details-panel">
                <div className="details-empty">Không có cuộc trò chuyện được chọn.</div>
            </div>
        )
    }

    return (
        <div className="details-panel">
            <header className="details-header">
                <h2 className="details-title">Thông tin nhóm</h2>
            </header>

            <div className="details-group">
                <div className="details-avatar">
                    <img src={conversation.image} alt="" />
                </div>
                <div className="details-name-row">
                    <span className="details-name">{conversation.name}</span>
                    <i className="bi bi-pencil details-edit" title="Chỉnh sửa tên nhóm" />
                </div>
            </div>

            <div className="details-actions">
                <button type="button" className="details-action" aria-label="Tắt thông báo" title="Tắt thông báo">
                    <i className="bi bi-bell-slash"></i>
                    <span>Tắt thông báo</span>
                </button>
                <button type="button" className="details-action" aria-label="Ghim nhóm" title="Ghim nhóm">
                    <i className="bi bi-star"></i>
                    <span>Ghim nhóm</span>
                </button>
                <button type="button" className="details-action" aria-label="Thành viên nhóm" title="Thành viên nhóm">
                    <i className="bi bi-people"></i>
                    <span>Thành viên nhóm</span>
                </button>
                <button type="button" className="details-action" aria-label="Quản lý nhóm" title="Quản lý nhóm">
                    <i className="bi bi-gear"></i>
                    <span>Quản lý nhóm</span>
                </button>
            </div>

            <div className="details-section">
                <div className="details-section-head">
                    <span className="details-section-title">Thành viên nhóm</span>
                    <span className="details-section-sub">3 thành viên</span>
                    <i className="bi bi-chevron-right"></i>
                </div>
            </div>

            <div className="details-section">
                <div className="details-section-head">
                    <span className="details-section-title">Bản tin nhắn</span>
                    <i className="bi bi-chevron-right"></i>
                </div>
                <div className="details-item">
                    <i className="bi bi-clock"></i>
                    <span>Danh sách nhắn hạn</span>
                </div>
                <div className="details-item">
                    <i className="bi bi-mic"></i>
                    <span>Ghi chú, ghi âm, bản chồn</span>
                </div>
            </div>

            <div className="details-section">
                <div className="details-section-head">
                    <span className="details-section-title">Ảnh/Video</span>
                    <i className="bi bi-chevron-right"></i>
                </div>
                <div className="details-media-grid">
                    <div className="details-media"><i className="bi bi-image"></i></div>
                    <div className="details-media"><i className="bi bi-image"></i></div>
                    <div className="details-media"><i className="bi bi-image"></i></div>
                    <div className="details-media"><i className="bi bi-image"></i></div>
                    <div className="details-media details-media--video">
                        <i className="bi bi-file-earmark-media-fill"></i>
                    </div>
                </div>
                <button type="button" className="details-view-all">Xem tất cả</button>
            </div>
        </div>
    )
}

export default DetailPanel