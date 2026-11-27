import { useState, type FormEvent } from 'react'
import { useAppDispatch } from '../../app/hook'
import { joinRoom } from '../../services/roomService'
import { getConversationId } from '../../utils/conversationId'
import { openConversation } from './conversationSlice'
import avatar from '../../assets/Screenshot 2026-10-30 121448.png'

export default function JoinRoomForm({ onClose }: { onClose: () => void }) {
    const dispatch = useAppDispatch()
    const [roomName, setRoomName] = useState('')
    const [error, setError] = useState('')
    const [joining, setJoining] = useState(false)

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const name = roomName.trim()
        if (!name || joining) return

        setError('')
        setJoining(true)
        try {
            const room = await joinRoom(name)

            dispatch(openConversation({
                id: getConversationId(room.name, true),
                name: room.name,
                image: avatar,
                lastMessage: '',
                time: '',
                unreadCount: 0,
                isPriority: false,
                isGroup: true,
            }))
            onClose()
        } catch (err) {
            setError(err instanceof Error ? err.message : "Không vào được phòng")
        } finally {
            setJoining(false)
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <label htmlFor="join-room-name">Nhập tên phòng</label>
            <input
                id="join-room-name"
                className="search-conversation"
                value={roomName}
                onChange={event => setRoomName(event.target.value)}
                disabled={joining}
                required
            />
            {error && <p role="alert">{error}</p>}
            <button type="submit" disabled={joining || !roomName.trim()}>
                {joining ? 'Đang vào phòng…' : 'Vào phòng'}
            </button>
            <button type="button" onClick={onClose} disabled={joining}>
                Hủy
            </button>
        </form>
    )
}