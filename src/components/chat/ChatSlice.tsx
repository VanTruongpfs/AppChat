import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { MessageData, RoomMember } from './types.ts';

interface ChatState {
    messagesByConversation: Record<number, MessageData[]>;
    pageByConversation: Record<number, number>;
    hasMoreByConversation: Record<number, boolean>;
    loadingByConversation: Record<number, boolean>;
    errorByConversation: Record<number, string>;
    membersByConversation: Record<number, RoomMember[]>;
}

const initialState: ChatState = {
    messagesByConversation: {},
    pageByConversation: {},
    hasMoreByConversation: {},
    loadingByConversation: {},
    errorByConversation: {},
    membersByConversation: {},
};

export const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        setMessages(state, action: PayloadAction<{ conversationId: number; messages: MessageData[] }>) {
            const { conversationId, messages } = action.payload;
            state.messagesByConversation[conversationId] = messages;
            state.errorByConversation[conversationId] = '';
        },
        prependMessages(state, action: PayloadAction<{ conversationId: number; messages: MessageData[] }>) {
            const { conversationId, messages } = action.payload;
            state.messagesByConversation[conversationId] = [
                ...messages,
                ...(state.messagesByConversation[conversationId] ?? []),
            ];
        },
        setPage(state, action: PayloadAction<{ conversationId: number; page: number }>) {
            state.pageByConversation[action.payload.conversationId] = action.payload.page;
        },
        setHasMore(state, action: PayloadAction<{ conversationId: number; hasMore: boolean }>) {
            state.hasMoreByConversation[action.payload.conversationId] = action.payload.hasMore;
        },
        setLoading(state, action: PayloadAction<{ conversationId: number; loading: boolean }>) {
            state.loadingByConversation[action.payload.conversationId] = action.payload.loading;
        },
        setError(state, action: PayloadAction<{ conversationId: number; error: string }>) {
            state.errorByConversation[action.payload.conversationId] = action.payload.error;
        },
        setMembers(state, action: PayloadAction<{ conversationId: number; members: RoomMember[] }>) {
            state.membersByConversation[action.payload.conversationId] = action.payload.members;
        },
        clearConversation(state, action: PayloadAction<number>) {
            const id = action.payload;
            delete state.messagesByConversation[id];
            delete state.pageByConversation[id];
            delete state.hasMoreByConversation[id];
            delete state.loadingByConversation[id];
            delete state.errorByConversation[id];
            delete state.membersByConversation[id];
        },
        clearAllChat(state) {
            state.messagesByConversation = {};
            state.pageByConversation = {};
            state.hasMoreByConversation = {};
            state.loadingByConversation = {};
            state.errorByConversation = {};
            state.membersByConversation = {};
        },
    },
});

export const {
    setMessages,
    prependMessages,
    setPage,
    setHasMore,
    setLoading,
    setError,
    setMembers,
    clearConversation,
    clearAllChat,
} = chatSlice.actions;

export default chatSlice.reducer;
