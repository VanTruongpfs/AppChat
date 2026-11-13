import type { LoadMessagesResult } from "../components/chat/types";
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
            let response: any;
            try {
                response = JSON.parse(message.data);
            } catch {
                return;
            }
            if (response.status == "error") {
                cleanup();
                reject(new Error(response.mes || "Phòng không tồn tại hoặc không có quyền truy cập."));
                return;
            }
            if (response.event !== "CHAT_PEOPLE_GET_MES") return
            cleanup();
            const data = response.data
            let result: LoadMessagesResult
            if (Array.isArray(data.members)) {
                result = {
                    kind: "personal",
                    roomName: name,
                    messages: data,
                    hasMore: data.length === 50,
                }
            } else if (data && Array.isArray(data.messages)) {
                result = {
                    kind: "group",
                     roomName: data.name ?? name,
                    members: data.user ?? [],
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
type CheckUserOnlineResponse = {
    status: "success" | "error"
    event: "CHECK_USER_ONLINE" | "AUTH" |"ACTION_NOT_EXIT"
    data?: {
        status: boolean
    }
    mes?: string
}
export async function checkUserOnline(user: string): Promise<boolean> {
    const ws = await connectChatSocket()
    return new Promise((resolve, reject) => {
        const timer = window.setTimeout(() => {
            cleanup()
            reject(new Error("Server không phản hồi CHECK_USER_ONLINE."))
        }, 10000)
        function cleanup() {
            window.clearTimeout(timer)
            ws.removeEventListener("message", handleMessage)
            ws.removeEventListener("close", handleClose)
            ws.removeEventListener("error", handleError)
        }
        function handleMessage(message: MessageEvent) {
            let response: CheckUserOnlineResponse
            try {
                response = JSON.parse(message.data)
            } catch {
                return
            }
            if (response.event === "AUTH") {
                cleanup()
                reject(new Error(response.mes || "Bạn chưa đăng nhập!"))
                return
            }
            if (response.event === "ACTION_NOT_EXIT") {
                cleanup()
                reject(new Error("Server không hỗ trợ CHAT_CHECK_USER_ONLINE."))
                return
            }
            if (response.event !== "CHECK_USER_ONLINE") {
                return
            }
            cleanup()
            if (response.status === "success" && response.data) {
                resolve(response.data.status)
            } else {
                reject(new Error(
                    response.mes || "Không kiểm tra được trạng thái người dùng."
                ))
            }
        }
        function handleClose() {
            cleanup()
            reject(new Error("WebSocket đã bị đóng."))
        }
        function handleError() {
            cleanup()
            reject(new Error("Lỗi kết nối WebSocket."))
        }
        ws.addEventListener("message", handleMessage)
        ws.addEventListener("close", handleClose)
        ws.addEventListener("error", handleError)
        ws.send(JSON.stringify({
            action: "onchat",
            data: {
                event: "CHAT_CHECK_USER_ONLINE",
                data: {user}
            }
        }))
    })
}