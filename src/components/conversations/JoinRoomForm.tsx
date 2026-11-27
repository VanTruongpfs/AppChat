import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useAppDispatch } from '../../app/hook'
import { joinRoom } from '../../services/roomService'
import { getConversationId } from '../../utils/conversationId'
import { openConversation } from './conversationSlice'
import avatar from '../../assets/Screenshot 2026-10-30 121448.png'

export default function JoinRoomForm({ onClose }: { onClose: () => void }) {
    const dispatch = useAppDispatch()
    const dialogRef = useRef<HTMLDialogElement>(null)
    const [roomName, setRoomName] = useState('')
    const [error, setError] = useState('')
    const [joining, setJoining] = useState(false)
    useEffect(() => {
        const dialog = dialogRef.current
        if (!dialog) return
        dialog.showModal()
        return () => dialog.close()
    }, [])

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
        <dialog
            ref={dialogRef}
            className="create-room-modal"
            aria-labelledby="join-room-title"
            onCancel={event => {
                event.preventDefault()
                if (!joining) onClose()
            }}
        >
            <form className="create-room-form" onSubmit={handleSubmit}>
                <h2 id="join-room-title">Vào phòng</h2>
                <label>
                    Tên phòng
                    <input
                        type="text"
                        value={roomName}
                        onChange={event => setRoomName(event.target.value)}
                        placeholder="Nhập tên phòng"
                        disabled={joining}
                        autoFocus
                        required
                    />
                </label>
                {error && <p role="alert">{error}</p>}
                <footer>
                    <button type="button" onClick={onClose} disabled={joining}>
                        Hủy
                    </button>
                    <button type="submit" disabled={joining || !roomName.trim()}>
                        {joining ? 'Đang vào phòng…' : 'Vào phòng'}
                    </button>
                </footer>
            </form>
        </dialog>
    )
}