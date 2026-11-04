import { Navigate, Route, Routes } from 'react-router'
import AuthPage from '../Screens/auth/AuthPage'
import HomePage from '../Screens/home/HomePage'

export default function AppRoutes() {
    return (
        <>
            <Routes>
                <Route
                    path="/login"
                    element={<AuthPage mode="login" />}
                />
                <Route
                    path="/register"
                    element={<AuthPage mode="register" />}
                />
                <Route path="/chat" element={<HomePage />} />
                <Route
                    path="*"
                    element={<Navigate to="/login" replace />}
                />
            </Routes>
        </>
    )
}