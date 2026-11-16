import { useEffect, useRef } from 'react'
import { connectChatSocket } from '../services/connectSocket'
import { useAppDispatch } from '../app/hook'
import { appendMessages } from '../components/chat/ChatSlice'
import { type ConversationData } from '../components/conversations/Conversation'
import type { IncomingChat, MessageData } from '../components/chat/types'
export function useRealtimeChat(conversation: ConversationData[], authUser: string|null) {
    const dispatch = useAppDispatch();
    const conversationRef = useRef(conversation);
    const authUserRef = useRef(authUser);
    conversationRef.current = conversation;
    authUserRef.current=authUser;
    useEffect(()=>{
        let socket: WebSocket | null = null;
        let cancelled = false;
        function handleMessage(event: MessageEvent){
            if(typeof event.data !== "string"){
                return;
            }
            let response:{
                event?:string;
                status?:string;
                data?:IncomingChat
            }
            try {
                response = JSON.parse(event.data);
            }catch{
                return;
            }
            if(response.event !== "SEND_CHAT" || response.status !== "success" || !response.data){
                return;
            }
            const chat = response.data;
            const me = authUserRef.current;
            const isGroup = chat.type === 1;
            const isMine = chat.name ===me;
            if(isMine){
                return;
            }
            const partner = isGroup ? chat.to : chat.name;
            const conversation = conversationRef.current.find(
                c=>c.name === partner && c.isGroup === isGroup
            )
            if(!conversation) return;
            const timeFormat = {hour: '2-digit', minutes: '2-digit'} as const;
            const message:MessageData = {
                id: chat.id ?? Date.now(),
                text: chat.mes,
                time: chat.createAt ? new Date(chat.createAt.replace(' ','T'))
                        .toLocaleTimeString('vi-VN',timeFormat)
                        : new Date().toLocaleTimeString('vi-VN',timeFormat),
                isMine: false,
                type: 'text',
            }
            dispatch(appendMessages({conversationId: conversation.id, messages:[message]}))
        }
        connectChatSocket()
            .then(ws=>{
                if(cancelled) return;
                socket = ws;
                ws.addEventListener("message", handleMessage);
            })
            .catch(error=>{
                console.error("Lỗi kết nối nhận tin", error);
            })
        return () => {
            cancelled = true;
            socket?.removeEventListener("message", handleMessage);
        }
    },[dispatch])
}