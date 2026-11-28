import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import { useAppSelector } from '../app/hook'
import AuthPage from '../Screens/auth/AuthPage'
import HomePage from '../Screens/home/HomePage'
import { hasChatSession } from '../services/connectSocket'

function ProtectedRoute({ children }: { children: ReactNode }) {
    const status = useAppSelector(state => state.auth.status)

    if (status === 'authenticated') {
        return <>{children}</>
    }

    if (status !== 'error' && hasChatSession()) {
        return (
            <div style={{ display: 'grid', placeItems: 'center', minHeight: '100dvh' }}>
                Đang khôi phục phiên đăng nhập...
            </div>
        )
    }

    return <Navigate to="/login" replace />
}

export default function AppRoutes() {
    return (
        <>
            <Routes>
                <Route
                    path="/"
                    element={<Navigate to="/login" replace/> }
                    />
                <Route
                    path="/login"
                    element={<AuthPage mode="login" />}
                />
                <Route
                    path="/register"
                    element={<AuthPage mode="register" />}
                />
                <Route
                    path="/chat"
                    element={
                        <ProtectedRoute>
                            <HomePage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="*"
                    element={<Navigate to="/login" replace />}
                />
            </Routes>
        </>
    )
}