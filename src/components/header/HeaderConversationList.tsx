export default function HeaderConversationList() {
    return (
        <>
            <header className="conversation-list-header">
                <div>
                    <input type="text" placeholder="Tìm kiếm" className="search-conversation"/>
                    <i className="bi bi-person-add"></i>
                    <i className="bi bi-person-"></i>
                </div>
                <div>
                    <div>Ưu tiên</div>
                    <div>Khác</div>
                </div>
            </header>
        </>
    )
}