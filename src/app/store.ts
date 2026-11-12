import { configureStore } from '@reduxjs/toolkit'
import { authSlice } from '../components/auth/authSlice.ts'
import { chatSlice } from '../components/chat/ChatSlice.tsx'

export const store = configureStore({
    reducer: {
        auth: authSlice.reducer,
        chat: chatSlice.reducer,
    },
    devTools: import.meta.env.DEV,
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch