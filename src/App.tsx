import { useEffect } from 'react';
import './App.css';
import AppRoutes from './Route/Route';
import { connectChatSocket } from './services/connectSocket';
import { useAppDispatch } from './app/hook';
import { logginSuccess, logoutSuccess } from './components/auth/authSlice';
import { clearAllChat } from './components/chat/ChatSlice';
import { clearConversations } from './components/conversations/conversationSlice';

export default function App() {
    const dispatch = useAppDispatch();

    useEffect(() => {
        connectChatSocket().catch(() => {});

        const onReloginSuccess = (e: Event) => {
            const { user, reLoginCode } = (e as CustomEvent).detail;
            dispatch(logginSuccess({ user, reLoginCode }));
        };

        const onSessionExpired = () => {
            dispatch(clearAllChat());
            dispatch(clearConversations());
            dispatch(logoutSuccess());
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