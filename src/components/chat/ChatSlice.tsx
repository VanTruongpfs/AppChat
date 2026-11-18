import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { MessageData, RoomMember } from './types.ts';

interface ChatState {
    messagesByConversation: Record<string, MessageData[]>;
    pageByConversation: Record<string, number>;
    hasMoreByConversation: Record<string, boolean>;
    loadingByConversation: Record<string, boolean>;
    errorByConversation: Record<string, string>;
    membersByConversation: Record<string, RoomMember[]>;
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
        setMessages(state, action: PayloadAction<{ conversationId: string; messages: MessageData[] }>) {
            const { conversationId, messages } = action.payload;
            state.messagesByConversation[conversationId] = messages;
            state.errorByConversation[conversationId] = '';
        },
        prependMessages(state, action: PayloadAction<{ conversationId: string; messages: MessageData[] }>) {
            const { conversationId, messages } = action.payload;
            state.messagesByConversation[conversationId] = [
                ...messages,
                ...(state.messagesByConversation[conversationId] ?? []),
            ];
        },
        setPage(state, action: PayloadAction<{ conversationId: string; page: number }>) {
            state.pageByConversation[action.payload.conversationId] = action.payload.page;
        },
        setHasMore(state, action: PayloadAction<{ conversationId: string; hasMore: boolean }>) {
            state.hasMoreByConversation[action.payload.conversationId] = action.payload.hasMore;
        },
        setLoading(state, action: PayloadAction<{ conversationId: string; loading: boolean }>) {
            state.loadingByConversation[action.payload.conversationId] = action.payload.loading;
        },
        setError(state, action: PayloadAction<{ conversationId: string; error: string }>) {
            state.errorByConversation[action.payload.conversationId] = action.payload.error;
        },
        setMembers(state, action: PayloadAction<{ conversationId: string; members: RoomMember[] }>) {
            state.membersByConversation[action.payload.conversationId] = action.payload.members;
        },
        clearConversation(state, action: PayloadAction<string>) {
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
        appendMessages(state, action: PayloadAction<{ conversationId: string; messages: MessageData[] }>) {
            const { conversationId, messages } = action.payload;
            state.messagesByConversation[conversationId] = [
                ...(state.messagesByConversation[conversationId] ?? []),
                ...messages,
            ];
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
    appendMessages,
    clearConversation,
    clearAllChat,
} = chatSlice.actions;

export default chatSlice.reducer;
