import { useState, type FormEvent } from 'react'
import { useAppDispatch, useAppSelector } from '../../app/hook'
import { checkUserExist } from '../../services/userService'
import { getConversationId } from '../../utils/conversationId'
import { openConversation } from './conversationSlice'
import avatar from '../../assets/Screenshot 2026-10-30 121448.png'

export default function StartChatForm({ onClose }: { onClose: () => void }) {
    const dispatch = useAppDispatch()
    const authUser = useAppSelector(state => state.auth.user)
    const [username, setUsername] = useState('')
    const [error, setError] = useState('')
    const [checking, setChecking] = useState(false)

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const name = username.trim()
        if (!name || checking) return

        if (name === authUser) {
            setError('Hãy nhập username của người bạn muốn nhắn.')
            return
        }

        setError('')
        setChecking(true)
        try {
            if (!(await checkUserExist(name))) {
                setError('Không tìm thấy tài khoản này.')
                return
            }

            dispatch(openConversation({
                id: getConversationId(name, false),
                name,
                image: avatar,
                lastMessage: '',
                time: '',
                unreadCount: 0,
                isPriority: false,
                isGroup: false,
            }))
            onClose()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Không kiểm tra được tài khoản.')
        } finally {
            setChecking(false)
        }
    }
    return (
        <form onSubmit={handleSubmit}>
            <label htmlFor="start-chat-username">Username người nhận</label>
            <input
            id="start-chat-username"
            className="search-conversation"
            value={username}
            onChange={event => setUsername(event.target.value)}
            disabled={checking}
            required
            />
        {error && <p role="alert">{error}</p>}
            <button type="submit" disabled={checking || !username.trim()}>
        {checking ? "Đang kiểm tra…" : "Mở hội thoại"}
            </button>
            <button type="button" onClick={onClose} disabled={checking}>
            Hủy
            </button>
        </form>
)
}