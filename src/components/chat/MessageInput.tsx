import { useState, type KeyboardEvent } from 'react'
type MessageInputProps = {
    onSend: (text: string) => void
}
export default function MessageInput({ onSend }: MessageInputProps) {
    const [value, setValue] = useState('')
    const sendMessage = () => {
        const text = value.trim()
        if (!text) return
        onSend(text)
        setValue('')
    }
    const handleKeyDown = (
        event: KeyboardEvent<HTMLInputElement>
    ) => {
        if (event.key === 'Enter') {
            event.preventDefault()
            sendMessage()
        }
    }
    return (
        <div className="message-input-area">
            <div className="message-input">
                <button
                    type="button"
                    className="message-input__tool"
                    title="Emoji"
                >
                    <i className="bi bi-emoji-smile" />
                </button>
                <input
                    type="text"
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Nhập tin nhắn..."
                />
                <button
                    type="button"
                    className="message-input__tool"
                    title="Đính kèm"
                >
                    <i className="bi bi-paperclip" />
                </button>
                <button
                    type="button"
                    className="message-input__send"
                    onClick={sendMessage}
                    disabled={!value.trim()}
                    title="Gửi tin nhắn"
                >
                    <i className="bi bi-send-fill" />
                </button>
            </div>
            <span className="message-input__hint">
                Nhấn Enter để gửi tin nhắn
            </span>
        </div>
    )
}
