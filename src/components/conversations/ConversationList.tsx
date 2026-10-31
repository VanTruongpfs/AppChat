
import Conversation, {
    type ConversationData
} from './Conversation'
type ConversationListProps = {
    conversations: ConversationData[]
    selectedId: number | null
    onSelect: (conversation: ConversationData) => void
}
export default function ConversationList({
                                             conversations,
                                             selectedId,
                                             onSelect
                                         }: ConversationListProps) {
    return (
        <div className="conversation-list">
            {conversations.map((conversation) => (
                <button
                    type="button"
                    key={conversation.id}
                    className={`conversation ${
                        selectedId === conversation.id
                            ? 'is-active'
                            : ''
                    }`}
                    onClick={() => onSelect(conversation)}
                >
                    <Conversation
                        conversation={conversation}
                    />
                </button>
            ))}
        </div>
    )
}
