import { useEffect } from 'react';
import './App.css';
import AppRoutes from './Route/Route';
import { connectChatSocket } from './services/connectSocket';
import { useAppDispatch } from './app/hook';
import { logginSuccess, logginFail } from './components/auth/authSlice'; // Sửa lại đường dẫn import authSlice đúng với thư mục của bạn

export default function App() {
    const dispatch = useAppDispatch();

    useEffect(() => {
        connectChatSocket().catch(() => {});

        const onReloginSuccess = (e: Event) => {
            const { user, reLoginCode } = (e as CustomEvent).detail;
            dispatch(logginSuccess({ user, reLoginCode }));
        };

        const onSessionExpired = (e: Event) => {
            const msg = (e as CustomEvent).detail.message;
            dispatch(logginFail(msg));
        };

        window.addEventListener("chat:relogin-success", onReloginSuccess);
        window.addEventListener("chat:session-expired", onSessionExpired);

        return () => {
            window.removeEventListener("chat:relogin-success", onReloginSuccess);
            window.removeEventListener("chat:session-expired", onSessionExpired);
        };
    }, [dispatch]);

    return <AppRoutes />;
}