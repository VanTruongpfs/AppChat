import React from "react"
import { useAppDispatch, useAppSelector } from '../../app/hook'
import ChatPanel from '../../components/chat/ChatPanel'
import ConversationSidebar from '../../components/conversations/ConversationSidebar'
import { selectConversation } from '../../components/conversations/conversationSlice'
import DetailPanel from '../../components/DetailPanel/DetailPanel'
import CreateRoomModal from '../../components/popupCreateGroup/CreateRoomModal'
import { useChatMessages } from '../../hooks/useChatMessages'
import { useCreateRoom } from '../../hooks/useCreateRoom'
import { useLoadConversations } from '../../hooks/useLoadConversations'
import { useRealtimeChat } from '../../hooks/useRealtimeChat'
import { useUserOnlineStatus } from '../../hooks/useUserOnlineStatus'
import '../../styles/css/HomePage.scss'

export default function HomePage() {
    const dispatch = useAppDispatch()
    const authUser = useAppSelector(state => state.auth.user)
    const {
        conversations,
        selectedConversationId,
        loading: isLoadingConversations,
        error: conversationsError,
    } = useAppSelector(state => state.conversation)
    const selectedConversation = conversations.find(
            conversation => conversation.id === selectedConversationId) ?? null
    const { showCreateRoom, setShowCreateRoom, handleCreateRoom } = useCreateRoom()

    useRealtimeChat(conversations,authUser);
    useLoadConversations()
    const {
        currentMessages,
        currentError,
        currentLoading,
        currentHasMore,
        handleSendMessage,
        handleLoadMore,
    } = useChatMessages(selectedConversation, authUser)
    const { onlineStatus, isCheckingOnline } = useUserOnlineStatus(selectedConversation)

    return (
        <>
            <div className="home-page">
                <ConversationSidebar
                    conversations={conversations}
                    selectedConversationId={selectedConversationId}
                    isLoadingConversations={isLoadingConversations}
                    conversationsError={conversationsError}
                    onSelect={conversation => {
                        dispatch(selectConversation(conversation.id))
                    }}
                    onCreateRoom={() => setShowCreateRoom(true)}
                />
                <section className="chat-panel">
                    <ChatPanel
                        conversation={selectedConversation}
                        messages={currentMessages}
                        onSendMessage={handleSendMessage}
                        onLoadMore={handleLoadMore}
                        isLoadingMore={currentLoading}
                        hasMore={currentHasMore}
                        error={currentError}
                        isOnline={onlineStatus}
                        isCheckingOnline={isCheckingOnline}
                    />
                </section>
                <section className="details-panel">
                    <DetailPanel conversation={selectedConversation} />
                </section>
            </div>
            {showCreateRoom && (
                <CreateRoomModal
                    friends={conversations
                        .filter(item => !item.isGroup)
                        .map(item => ({
                            name: item.name,
                            image: item.image,
                        }))}
                    onClose={() => setShowCreateRoom(false)}
                    onConfirm={handleCreateRoom}
                />
            )}
        </>
    )
}
