import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import EmojiPicker, { EmojiStyle, type EmojiClickData } from 'emoji-picker-react'
type MessageInputProps = {
    onSend: (text: string) => void
}
export default function MessageInput({ onSend }: MessageInputProps) {
    const [value, setValue] = useState('')
    const [showEmoji, setShowEmoji] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)
    const emojiRef = useRef<HTMLDivElement>(null)
    const sendMessage = () => {
        const text = value.trim()
        if (!text) return
        onSend(text)
        setValue('')
        setShowEmoji(false)
    }
    const handleKeyDown = (
        event: KeyboardEvent<HTMLInputElement>
    ) => {
        if(event.nativeEvent.isComposing) return
        if (event.key === 'Enter') {
            event.preventDefault()
            sendMessage()
        }
    }
    const insertEmoji = (emoiji: string) => {
        const input = inputRef.current
        const start = input?.selectionStart??value.length
        const end = input?.selectionEnd??value.length
        setValue(value.slice(0, start) + emoiji + value.slice(end))
        requestAnimationFrame(()=>{
            const pos =start + emoiji.length
            input?.focus()
            input?.setSelectionRange(pos,pos)
        });
    }
    useEffect(() => {
        if (!showEmoji) return
        const handleClickOutside = (e: MouseEvent) => {
            if (!emojiRef.current?.contains(e.target as Node)) setShowEmoji(false)
        }
        const handleEsc = (e: globalThis.KeyboardEvent) => {
            if (e.key === 'Escape') setShowEmoji(false)
        }
        document.addEventListener('mousedown', handleClickOutside)
        document.addEventListener('keydown', handleEsc)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            document.removeEventListener('keydown', handleEsc)
        }
    }, [showEmoji])
    return (
        <div className="message-input-area">
            <div className="message-input">
                <div className="emoji-wrapper" ref={emojiRef}>
                    <button
                        type="button"
                        className={`message-input__tool ${showEmoji ? 'is-active' : ''}`}
                        title="Emoji"
                        onClick={() => setShowEmoji((v) => !v)}
                    >
                        <i className="bi bi-emoji-smile" />
                    </button>
                    {showEmoji && (
                        <div className="emoji-picker" >
                            <EmojiPicker
                                onEmojiClick={(data: EmojiClickData) => insertEmoji(data.emoji)}
                                emojiStyle={EmojiStyle.NATIVE}
                                searchPlaceholder="Tìm emoji..."
                                previewConfig={{ showPreview: false }}
                                lazyLoadEmojis
                                width={340}
                                height={380}
                            />
                        </div>
                    )}
                </div>
                <input
                    ref={inputRef}
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
