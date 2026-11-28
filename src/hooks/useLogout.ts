import { useCallback, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { useAppDispatch } from '../app/hook'
import { logoutSuccess } from '../components/auth/authSlice'
import { clearAllChat } from '../components/chat/ChatSlice'
import { clearConversations } from '../components/conversations/conversationSlice'
import { logoutAccount } from '../services/userService'

export function useLogout() {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const [isLoggingOut, setIsLoggingOut] = useState(false)
    const loggingOutRef = useRef(false)

    const handleLogout = useCallback(async () => {
        if (loggingOutRef.current) return
        loggingOutRef.current = true
        setIsLoggingOut(true)

        try {
            await logoutAccount()
        } finally {
            dispatch(clearAllChat())
            dispatch(clearConversations())
            dispatch(logoutSuccess())
            loggingOutRef.current = false
            setIsLoggingOut(false)
            navigate('/login', { replace: true })
        }
    }, [dispatch, navigate])

    return {
        handleLogout,
        isLoggingOut,
    }
}
