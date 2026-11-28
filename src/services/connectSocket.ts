const WS_URL = "wss://chat.longapp.io.vn/chat/chat";
let socket: WebSocket | null = null;
const STORAGE_KEY = "chat_session_auth";
const TWO_HOURS_MS = 2 * 60 * 60 * 1000;
const MAX_RETRY_DELAY = 30000;
let retryCount = 0;
let retryTimer: number | null = null;
let isManualClose = false;
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

export function hasChatSession(): boolean {
    const session = getChatSession();
    return Boolean(session?.user && session?.code);
}

export function getOpenChatSocket(): WebSocket | null {
    return socket?.readyState === WebSocket.OPEN ? socket : null;
}

export function disconnectChatSocket() {
    isManualClose = true;
    clearChatSession();

    if (retryTimer) {
        window.clearTimeout(retryTimer);
        retryTimer = null;
    }
    retryCount = 0;

    if (socket) {
        const currentSocket = socket;
        socket = null;
        if (
            currentSocket.readyState === WebSocket.OPEN ||
            currentSocket.readyState === WebSocket.CONNECTING
        ) {
            currentSocket.close();
        }
    }
}
export function connectChatSocket(): Promise<WebSocket> {
    isManualClose = false;
    if(socket?.readyState === WebSocket.OPEN) {
        return Promise.resolve(socket);
    }
    if(connecting) {
        return connecting;
    }
    const connection = new WebSocket(WS_URL);
    socket = connection;

    connection.addEventListener("message", (e) => {
        try {
            const res = JSON.parse(e.data);
            if (res.event === "RE_LOGIN") {
                handleReLoginResponse(res);
            }
        } catch (error) {
            console.error("Error parsing WebSocket message:", error);
        }
    });
    connection.addEventListener("close", () => {
        if(socket === connection){
            socket = null;
        }
        if (!isManualClose) {      
            scheduleReconnect();   
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
        retryCount = 0;                      
        if (retryTimer) {                     
            window.clearTimeout(retryTimer);   
            retryTimer = null;                 
        }
        const session = getChatSession();
            if (session && session.user && session.code) {
                if (
                    session.firstDisconnectAt &&
                    Date.now() - session.firstDisconnectAt > TWO_HOURS_MS
                ) {
                    handleSessionExpired("Phiên đăng nhập đã quá 2 tiếng.");
                } else {
                    sendReLoginRequest(connection, session.user, session.code);
                }
            }
            resolve(connection);
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

function sendReLoginRequest(connection: WebSocket, user: string, code: string) {
    const request = {
        action: "onchat",
        data: {
            event: "RE_LOGIN",
            data: {
                user,
                code
            }
        }
    };
    connection.send(JSON.stringify(request));
}

function handleReLoginResponse(res: any) {
    if (res.status === "success" && res.data?.RE_LOGIN_CODE) {
        const currentSession = getChatSession();
        if (currentSession) {
            saveChatSession(currentSession.user, res.data.RE_LOGIN_CODE);

            window.dispatchEvent(
                new CustomEvent("chat:relogin-success", {
                    detail: {
                        user: currentSession.user,
                        reLoginCode: res.data.RE_LOGIN_CODE,
                    },
                })
            );
        }
        console.log("Re-login successful, session updated.");
    } else if (res.status === "error") {
        handleSessionExpired(res.mes || "Re-Login error, session expired!");
    }
}

function handleSessionExpired(reason: string) {
    console.warn("Dừng tự động kết nối:", reason);
    isManualClose = true;
    clearChatSession();

    if (retryTimer) {
        window.clearTimeout(retryTimer);
        retryTimer = null;
    }
    if (socket) {
        socket.close();
        socket = null;
    }

    window.dispatchEvent(
        new CustomEvent("chat:session-expired", { detail: { message: reason } })
    );
}
function scheduleReconnect() {
    if (retryTimer) return;

    const session = getChatSession();
    if (!session) return;

    if (!session.firstDisconnectAt) {
        session.firstDisconnectAt = Date.now();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    }

    if (Date.now() - session.firstDisconnectAt > TWO_HOURS_MS) {
        handleSessionExpired("Quá 2 tiếng mất kết nối.");
        return;
    }

    const delay = Math.min(1000 * Math.pow(2, retryCount), MAX_RETRY_DELAY);
    retryCount++;

    retryTimer = window.setTimeout(() => {
        retryTimer = null;
        connectChatSocket().catch(() => {});
    }, delay);
}
window.addEventListener("online", () => {
    const session = getChatSession();
    if (session && !isManualClose) {
        if (retryTimer) {
            window.clearTimeout(retryTimer);
            retryTimer = null;
        }
        connectChatSocket().catch(() => {});
    }
});