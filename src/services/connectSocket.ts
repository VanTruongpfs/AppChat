const WS_URL = "wss://chat.longapp.io.vn/chat/chat";
let socket: WebSocket | null = null;
let connecting: Promise<WebSocket> | null= null;
export function connectChatSocket(): Promise<WebSocket> {
    if(socket?.readyState === WebSocket.OPEN) {
        return Promise.resolve(socket);
    }
    if(connecting) {
        return connecting;
    }
    const connection = new WebSocket(WS_URL);
    socket = connection;
    connection.addEventListener("close", () => {
        if(socket === connection){
            socket = null;
        }
    })
    connecting = new Promise<WebSocket>((resolve, reject) => {
        const timer = window.setTimeout(()=>{
            fail("Kết nối quá lâu, hãy thử lại.")
        },10000)
    function cleanup(){
        window.clearTimeout(timer)
        connection.removeEventListener("open", handleOpen)
        connection.removeEventListener("error", handleError)
        connection.removeEventListener("close", handleClose)
    }
    function fail(message: string) {
        cleanup();
        if(socket===connection){
            socket = null;
        }
        connection.close();
        reject(new Error(message));

    }
    function handleOpen() {
        cleanup()
        resolve(connection)
    }
    function handleError() {
        fail("Không kết nối được")
    }
    function handleClose() {
        fail("Kết nối bị đóng")
    }
    connection.addEventListener("open", handleOpen)
    connection.addEventListener("error", handleError)
    connection.addEventListener("close", handleClose)
    }).finally(() => {
    connecting = null
    })
    return connecting
}
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