import { useState } from 'react'
import StartChatForm from '../conversations/StartChatForm'
import JoinRoomForm from '../conversations/JoinRoomForm'
type HeaderConversationListProps = {
    onCreateRoom: () => void
}
export default function HeaderConversationList({onCreateRoom}:HeaderConversationListProps) {
    const [showStartChat, setShowStartChat] = useState(false)
    const [showJoinRoom, setShowJoinRoom] = useState(false)
    return (
        <>
            <header className="conversation-list-header">
                <div>
                    <input type="text" placeholder="Tìm kiếm" className="search-conversation"/>
                    <button
                        type="button"
                        className="add-friend"
                        aria-label="Nhắn tin mới"
                        title="Nhắn tin mới"
                        aria-expanded={showStartChat}
                        onClick={() => {
                            setShowJoinRoom(false)
                            setShowStartChat(true)
                        }}
                    >
                        <i className="bi bi-person-add" aria-hidden="true" />
                    </button>
                    <button
                        type="button"
                        className="group"
                        aria-label="Tạo phòng chat"
                        title="Tạo phòng chat"
                        onClick={onCreateRoom}
                    >
                        <i className="bi bi-people" aria-hidden="true"></i>
                    </button>
                    <button
                        type="button"
                        className="group"
                        aria-label="Vào phòng chat"
                        title="Vào phòng chat"
                        aria-expanded={showJoinRoom}
                        onClick={() => {
                            setShowStartChat(false)
                            setShowJoinRoom(true)
                        }}
                    >
                        <i className="bi bi-box-arrow-in-right" aria-hidden="true"></i>
                    </button>
                </div>
                <div>
                    <div>Ưu tiên</div>
                    <div>Khác</div>
                </div>
                {showStartChat && (
                    <StartChatForm onClose={() => setShowStartChat(false)} />
                )}
                {showJoinRoom && (
                    <JoinRoomForm onClose={() => setShowJoinRoom(false)} />
                )}
            </header>
        </>
    )
}