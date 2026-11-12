type HeaderConversationListProps = {
    onCreateRoom: () => void
}
export default function HeaderConversationList({onCreateRoom}:HeaderConversationListProps) {
    return (
        <>
            <header className="conversation-list-header">
                <div>
                    <input type="text" placeholder="Tìm kiếm" className="search-conversation"/>
                    <i className="bi bi-person-add"></i>
                    <button
                        type="button"
                        className="group"
                        aria-label="Tạo phòng chat"
                        title="Tạo phòng chat"
                        onClick={onCreateRoom}
                    >
                        <i className="bi bi-people" aria-hidden="true"></i>
                    </button>
                </div>
                <div>
                    <div>Ưu tiên</div>
                    <div>Khác</div>
                </div>
            </header>
        </>
    )
}