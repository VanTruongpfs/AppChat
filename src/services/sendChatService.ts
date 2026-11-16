import {connectChatSocket} from "./connectSocket.ts";

export async function sendChatMessage(to: string, message: string, isGroup: boolean): Promise<void> {
    const mes = message.trim()
    if (!mes) return
    const ws = await connectChatSocket()
    const request = {
        action: "onchat",
        data: {
            event: "SEND_CHAT",
            data: {
                type: isGroup ? "room" : "people",
                to,
                mes,
            },
        },
    }
    ws.send(JSON.stringify(request))
}