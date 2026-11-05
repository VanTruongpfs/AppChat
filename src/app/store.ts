import { configureStore } from '@reduxjs/toolkit'
import { authSlice } from '../components/auth/authSlice.ts'

export const store = configureStore({
    reducer: {
        auth: authSlice.reducer,
    },
    devTools: import.meta.env.DEV,
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch