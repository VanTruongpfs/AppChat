export type MessageType = 'text' | 'image' | 'file'
export type MessageData = {
    id: number
    text: string
    time: string
    isMine: boolean
    type: MessageType
    fileName?: string
}

export type ChatKind = 'personal' | 'group'

export interface ServerMessage {
    id: number
    name: string
    to: string
    mes: string
    createdAt: string
    type: ChatKind
}

export interface RoomMember {
    id: number
    name: string
}

export interface LoadMessagesResult {
    kind: ChatKind
    roomName: string
    members?: RoomMember[]
    messages: ServerMessage[]
    hasMore: boolean
}

