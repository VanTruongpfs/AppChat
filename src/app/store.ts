import { configureStore } from '@reduxjs/toolkit'
import { authSlice } from '../components/auth/authSlice.ts'
import { chatSlice } from '../components/chat/ChatSlice.tsx'
import { conversationSlice } from '../components/conversations/conversationSlice'

export const store = configureStore({
    reducer: {
        auth: authSlice.reducer,
        chat: chatSlice.reducer,
        conversation: conversationSlice.reducer,
    },
    devTools: import.meta.env.DEV,
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch