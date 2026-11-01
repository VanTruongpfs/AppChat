export type MessageType = 'text' | 'image' | 'file'
export type MessageData = {
    id: number   //id tin nhan
    text: string   //noi dung
    time: string // thoi gian gui
    isMine: boolean // tin nhan cua minh hay cua ban
    type: MessageType // loai tin nhan ( hinh anh, van ban, am thanh)
    fileName?: string // tin nhan la file dinh kem
}