import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { type ConversationData } from './Conversation'
interface conversationState {
    conversations: ConversationData[]
    selectedConversationId: string | null
    loading: boolean
    error: string
}
const initialState: conversationState = {
    conversations: [],
    selectedConversationId: null,
    loading: false,
    error: '',
}
export const conversationSlice = createSlice({
    name: 'conversation',
    initialState,
    reducers: {
        setConversations: (state, action: PayloadAction<ConversationData[]>) => {
            state.conversations = action.payload
            const selectedStillExists = action.payload.some(
                conversation => conversation.id === state.selectedConversationId
            )
            if (!selectedStillExists) {
                state.selectedConversationId = action.payload[0]?.id ?? null
            }
        },
        selectConversation: (state, action: PayloadAction<string|null>) => {
            state.selectedConversationId = action.payload
            const conversation = state.conversations.find(
                item => item.id === action.payload
            )
            if (conversation) {
                conversation.unreadCount = 0;
            }
        },
        setConversationLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload
        },
        setConversationError: (state, action: PayloadAction<string>) => {
            state.error = action.payload
        },
        openConversation: (state, action: PayloadAction<ConversationData>) => {
            const conversation = action.payload
            const existing = state.conversations.find(
                item => item.id === conversation.id
            )
            if (!existing) {
                state.conversations.unshift(conversation)
            }else{
                existing.unreadCount = 0
            }
            state.selectedConversationId = conversation.id
        },
        addConversationIfMissing: (state, action: PayloadAction<ConversationData>) => {
            const conversation = action.payload
            const exist = state.conversations.some(
                item => item.id === conversation.id
            )
            if (!exist) {
                state.conversations.unshift(conversation)
            }
        },
        removeConversation: (state, action: PayloadAction<string>) => {
            const id = action.payload
            const removedIndex = state.conversations.findIndex(
                conversation => conversation.id === id
            )
            if (removedIndex === -1) return
            state.conversations.splice(removedIndex, 1)
            if (state.selectedConversationId === id) {
                const nextIndex = Math.min(
                    removedIndex,
                    state.conversations.length - 1
                )
                state.selectedConversationId =
                    state.conversations[nextIndex]?.id ?? null
            }
        },
        clearConversations: () => {
            return initialState;
        },
    },
})
export const {setConversations, selectConversation, setConversationLoading, openConversation,setConversationError, addConversationIfMissing,clearConversations,removeConversation} = conversationSlice.actions
export default conversationSlice.reducer