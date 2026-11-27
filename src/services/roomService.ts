import { connectChatSocket } from "./connectSocket";
export type RoomInfo = {
    name: string;
}
type RoomEvent = "CREATE_ROOM" | "JOIN_ROOM";
export type RoomResponse = {
    event: RoomEvent;
    status: "success" | "error";
    data?: RoomInfo;
    mes?: string;
}
export async function sendRoomRequest(event: RoomEvent, name: string, failMessage: string): Promise<RoomInfo> {
    const roomName = name.trim()

    if (!roomName) {
        throw new Error("Bạn chưa nhập tên phòng.")
    }

    const ws = await connectChatSocket()

    return new Promise<RoomInfo>((resolve, reject) => {
        const timer = window.setTimeout(() => {
            cleanup()
            reject(new Error(`Server không phản hồi ${event}`))
        }, 10000)
        function cleanup() {
            window.clearTimeout(timer)
            ws.removeEventListener("message", handleMessage)
            ws.removeEventListener("close", handleDisconnect)
            ws.removeEventListener("error", handleDisconnect)
        }
        function handleMessage(message: MessageEvent) {
            if (typeof message.data !== "string") return
            let response: RoomResponse
            try {
                response = JSON.parse(message.data)
            } catch {
                return
            }
            if (response?.event !== event) return
            cleanup()
            if (
                response.status === "success" &&
                typeof response.data?.name === "string"
            ) {
                resolve(response.data)
            } else {
                reject(new Error(response.mes || failMessage))
            }
        }

        function handleDisconnect() {
            cleanup()
            reject(new Error("Kết nối WebSocket bị gián đoạn."))
        }

        ws.addEventListener("message", handleMessage)
        ws.addEventListener("close", handleDisconnect)
        ws.addEventListener("error", handleDisconnect)

        try {
            const request = {
                action: "onchat",
                data: {
                    event,
                    data: {
                        name: roomName,
                    },
                },
            }
            ws.send(JSON.stringify(request))
        } catch (error) {
            cleanup()
            reject(error)
        }
    })
}
export function createRoom(name: string): Promise<RoomInfo> {
    return sendRoomRequest("CREATE_ROOM", name, "Không tạo được phòng.")
}

export function joinRoom(name: string): Promise<RoomInfo> {
    return sendRoomRequest("JOIN_ROOM", name, "Không vào được phòng.")
}
