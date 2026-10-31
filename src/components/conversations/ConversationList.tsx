import Conversation, { type ConversationData } from './Conversation'
type ConversationListProps = {
    conversations: ConversationData[]
}
function ConversationList({conversations}: ConversationListProps) {
    return (
        <>
        {conversations.map(conversation => (
            <div className="conversation-list">
                <div key={conversation.id} className="conversation">
                    <Conversation conversation={conversation}/>
                </div>
            </div>
        ))}</>
    )
}
export default ConversationList