export type MessageType = 'text' | 'image' | 'file'
export type MessageData = {
    id: number
    text: string
    time: string
    isMine: boolean
    type: MessageType
    fileName?: string
}