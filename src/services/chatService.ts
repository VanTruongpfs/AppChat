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