import type { MessageData } from './types'
type MessageItemProps = {
    message: MessageData
    avatar: string
    senderName: string
}
export default function MessageItem({
                                        message,
                                        avatar,
                                        senderName
                                    }: MessageItemProps) {
    return (
        <div className={`message-row ${
            message.isMine
                ? 'message-row--mine'
                : 'message-row--other'
        }`}>
            {/* Avatar đối phương */}
            {!message.isMine && (
                <img
                    className="message-row__avatar"
                    src={avatar}
                    alt={senderName}
                />
            )}
            <div className="message-row__content">
                {!message.isMine && (
                    <span className="message-row__sender">
                        {senderName}
                    </span>
                )}
                <div className={`message-bubble ${
                    message.isMine
                        ? 'message-bubble--mine'
                        : 'message-bubble--other'
                }`}>
                    {message.type === 'image' ? (

                        <div className="message-image-placeholder">
                            <i className="bi bi-image" />
                            <span>{message.text || 'Hình ảnh'}</span>
                        </div>
                    ) : message.type === 'file' ? (

                        <div className="message-file-placeholder">
                            <i className="bi bi-file-earmark-text" />
                            <span>
                                {message.fileName || message.text}
                            </span>
                        </div>

                    ) : (<p>{message.text}</p>)}
                </div>
                <span className="message-row__time">
                    {message.time}
                </span>
            </div>
        </div>
    )
}
