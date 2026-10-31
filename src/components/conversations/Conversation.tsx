export type ConversationData = {
    id: number
    name: string
    lastMessage: string
    time: string
    unreadCount: number
    isPriority: boolean
    isGroup: boolean
    image: string
}
type ConversationProps = {
    conversation: ConversationData
}
function Conversation({conversation}: ConversationProps) {
    return(
        <>
            <img className="avatar-conversiton" src={conversation.image} alt=""/>
            <div>
                <div>
                    <span className="name-conversation">{conversation.name}</span>
                    <span className="time-conversation">{conversation.time}</span>
                </div>
                <p className="last-message">{conversation.lastMessage}</p>
            </div>
        </>
    )
}
export default Conversation;