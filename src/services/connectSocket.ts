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
