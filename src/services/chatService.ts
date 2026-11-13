import type { LoadMessagesResult, RoomMember, ServerMessage } from "../components/chat/types";
import { connectChatSocket } from "./connectSocket";
export type ChatUserItem ={
    name: string
    type: 0 | 1
    actionTime: string
}
type GetUserListResponse = {
    status: "success" | "error"
    event: "GET_USER_LIST"
    data?: ChatUserItem[]
    mes?: string
}
export async function getUserList(): Promise<ChatUserItem[]> {
    const ws = await connectChatSocket();
    return new Promise((resolve, reject) => {
        const timer = window.setTimeout(() => {
            cleanup();
            reject(new Error("Server không phản hồi GET_USER_LIST."));
        }, 10000);
        function cleanup() {
            window.clearTimeout(timer);
            ws.removeEventListener("message", handleMessage);
            ws.removeEventListener("close", handleClose);
            ws.removeEventListener("error", handleError);
        }
        function handleMessage(message: MessageEvent) {
            let response: GetUserListResponse;
            try {
                response = JSON.parse(message.data);
            } catch {
                return;
            }
            if (response.event !== "GET_USER_LIST") {
                return;
            }
            cleanup();
            if (response.status === "success") {
                resolve(response.data ?? []);
            } else {
                reject(new Error(
                    response.mes || "Không lấy được danh sách hội thoại."
                ));
            }
        }
        function handleClose() {
            cleanup();
            reject(new Error("WebSocket đã bị đóng."));
        }
        function handleError() {
            cleanup();
            reject(new Error("Lỗi kết nối WebSocket."));
        }
        ws.addEventListener("message", handleMessage);
        ws.addEventListener("close", handleClose);
        ws.addEventListener("error", handleError);
        ws.send(JSON.stringify({
            action: "onchat",
            data: {
                event: "GET_USER_LIST",
                data: {}
            }
        }));
    });
}

export async function getChatMessages(name: string, page:number): Promise<LoadMessagesResult> {
    const ws = await connectChatSocket();
    return new Promise((resolve, reject) => {
        const timer = window.setTimeout(() => {
            cleanup();
            reject(new Error("Server không phản hồi CHAT_PEOPLE_GET_MES."));
        }, 10000);
        function cleanup() {
            window.clearTimeout(timer);
            ws.removeEventListener("message", handleMessage);
            ws.removeEventListener("close", handleClose);
            ws.removeEventListener("error", handleError);
        }
        function handleMessage(message: MessageEvent) {
            let response: {
                status?: string
                event?: string
                data?: unknown
                mes?: string
            };
            try {
                response = JSON.parse(message.data);
            } catch {
                return;
            }
            if (
                response.status === "error" &&
                (response.event === "CHAT_PEOPLE_GET_MES" || response.event === "GET_ROOM_CHAT_MES")
            ) {
                cleanup();
                reject(new Error(response.mes || "Phòng không tồn tại hoặc không có quyền truy cập."));
                return;
            }
            if (response.event !== "CHAT_PEOPLE_GET_MES") return;
            if (response.status !== "success") {
                cleanup();
                reject(new Error(response.mes || "Không thể tải tin nhắn."));
                return;
            }
            const data = response.data;
            let result: LoadMessagesResult
            if (Array.isArray(data) && data.every(isServerMessage)) {
                result = {
                    kind: "personal",
                    roomName: name,
                    messages: data,
                    hasMore: data.length === 50,
                }
            } else if (
                isRecord(data) &&
                Array.isArray(data.chatMess) &&
                data.chatMess.every(isServerMessage)
            ) {
                const members = Array.isArray(data.user) && data.user.every(isRoomMember)
                    ? data.user
                    : [];
                result = {
                    kind: "group",
                    roomName: typeof data.name === "string" ? data.name : name,
                    members,
                    messages: data.chatMess,
                    hasMore: data.chatMess.length === 50,
                }
            } else {
                reject(new Error("Dữ liệu không hợp lệ từ server."));
                return;
            }
            resolve(result);
        }
        function handleClose() {
            cleanup();
            reject(new Error("WebSocket đã bị đóng."));
        }
        function handleError() {
            cleanup();
            reject(new Error("Lỗi kết nối WebSocket."));
        }
        ws.addEventListener("message", handleMessage);
        ws.addEventListener("close", handleClose);
        ws.addEventListener("error", handleError);
        ws.send(JSON.stringify({
            action: "onchat",
            data: {
                event: "CHAT_PEOPLE_GET_MES",
                data: {
                    name,
                    page
                }
            }
        }));
    });
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function isServerMessage(value: unknown): value is ServerMessage {
    return isRecord(value) &&
        typeof value.id === "number" &&
        typeof value.name === "string" &&
        typeof value.to === "string" &&
        typeof value.mes === "string" &&
        typeof value.createAt === "string" &&
        (value.type === 0 || value.type === 1);
}

function isRoomMember(value: unknown): value is RoomMember {
    return isRecord(value) &&
        typeof value.id === "number" &&
        typeof value.name === "string";
}