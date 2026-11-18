const WS_URL = "wss://chat.longapp.io.vn/chat/chat";
let socket: WebSocket | null = null;
const STORAGE_KEY = "chat_session_auth";
interface StoredSession {
    user: string;
    code: string;
    firstDisconnectAt: number | null; 
}
let connecting: Promise<WebSocket> | null= null;

export function saveChatSession(user: string, code: string) {
    const session: StoredSession = {
        user,
        code,
        firstDisconnectAt: null
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

function getChatSession(): StoredSession | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw) as StoredSession;
    } catch {
        return null;
    }
}

export function clearChatSession() {
    localStorage.removeItem(STORAGE_KEY);
}
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
