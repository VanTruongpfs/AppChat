
import { useCallback, useEffect, useState } from "react"
import { useAppDispatch } from "../app/hook"
import { clearConversation } from "../components/chat/ChatSlice"
import {removeConversation} from "../components/conversations/conversationSlice"
import type {ConversationData} from "../components/conversations/Conversation"
import { outRoom } from "../services/roomService"
export function useLeaveRoom(
    conversation: ConversationData | null
) {
    const dispatch = useAppDispatch()
    const [isLeavingRoom, setIsLeavingRoom] = useState(false)
    const [leaveRoomError, setLeaveRoomError] = useState("")
    useEffect(() => {
        setLeaveRoomError("")
    }, [conversation?.id])
    const handleLeaveRoom = useCallback(async () => {
        if (!conversation || !conversation.isGroup || isLeavingRoom) {
            return
        }
        setIsLeavingRoom(true)
        setLeaveRoomError("")
        try {
            await outRoom(conversation.name)
            dispatch(clearConversation(conversation.id))
            dispatch(removeConversation(conversation.id))
        } catch (error) {
            setLeaveRoomError(
                error instanceof Error
                    ? error.message
                    : "Không thể rời khỏi phòng."
            )
        } finally {
            setIsLeavingRoom(false)
        }
    }, [conversation, dispatch, isLeavingRoom])
    return {
        handleLeaveRoom,
        isLeavingRoom,
        leaveRoomError,
    }
}
