import { connectChatSocket } from "./connectSocket";
export type CreatedRoom = {
    name: string;
}

export type CreateRoomResponse = {
    event: "CREATE_ROOM";
    status: "success" | "error";
    data?: CreatedRoom;
    mes?: string;
}
export async function createRoom(name: string): Promise<CreatedRoom> {
    const roomName = name.trim()

    if (!roomName) {
        throw new Error("Bạn chưa nhập tên phòng.")
    }

    const ws = await connectChatSocket()

    return new Promise<CreatedRoom>((resolve, reject) => {
        const timer = window.setTimeout(() => {
            cleanup()
            reject(new Error("Server không phản hồi CREATE_ROOM."))
        }, 10000)
        function cleanup() {
            window.clearTimeout(timer)
            ws.removeEventListener("message", handleMessage)
            ws.removeEventListener("close", handleDisconnect)
            ws.removeEventListener("error", handleDisconnect)
        }
        function handleMessage(message: MessageEvent) {
            if (typeof message.data !== "string") return
            let response: CreateRoomResponse
            try {
                response = JSON.parse(message.data)
            } catch {
                return
            }
            if (response?.event !== "CREATE_ROOM") return
            cleanup()
            if (
                response.status === "success" &&
                typeof response.data?.name === "string"
            ) {
                resolve(response.data)
            } else {
                reject(new Error(response.mes || "Không tạo được phòng."))
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
                    event: "CREATE_ROOM",
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