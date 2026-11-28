import {
    clearChatSession,
    connectChatSocket,
    disconnectChatSocket,
    getOpenChatSocket,
} from './connectSocket'

type CheckUserExistResponse = {
    event: string
    status: string
    data: {
        status: boolean
    }
    mes: string
}

export async function checkUserExist(user: string): Promise<boolean> {
    const username = user.trim()
    if (!username) throw new Error("Bạn chưa nhập username.")

    const ws = await connectChatSocket()

    return new Promise<boolean>((resolve, reject) => {
        const timer = window.setTimeout(
            () => fail(new Error("Server không phản hồi.")),
            10000
        )

        function cleanup() {
            window.clearTimeout(timer)
            ws.removeEventListener("message", onMessage)
            ws.removeEventListener("close", onDisconnect)
            ws.removeEventListener("error", onDisconnect)
        }

        function fail(error: unknown) {
            cleanup()
            reject(error)
        }

        function onDisconnect() {
            fail(new Error("Kết nối bị gián đoạn."))
        }

        function onMessage(message: MessageEvent) {
            if (typeof message.data !== "string") return

            let response: CheckUserExistResponse
            try {
                response = JSON.parse(message.data)
            } catch {
                return
            }

            if (response?.event === "AUTH" || response?.event === "ACTION_NOT_EXIT") {
                return fail(new Error(response.mes || "Không thể kiểm tra tài khoản."))
            }

            if (response?.event !== "CHECK_USER_EXIST") return

            cleanup()
            if (response.status === "success" && typeof response.data?.status === "boolean") {
                resolve(response.data.status)
            } else {
                reject(new Error(response.mes || "Không kiểm tra được tài khoản."))
            }
        }
        ws.addEventListener("message", onMessage)
        ws.addEventListener("close", onDisconnect)
        ws.addEventListener("error", onDisconnect)
        try {
            const request ={
                action: "onchat",
                data: {
                    event: "CHAT_CHECK_USER_EXIST",
                    data: { user: username },
                },
            }
            ws.send(JSON.stringify(request))
        } catch (error) {
            fail(error)
        }
    })
}

type LogoutResponse = {
    event?: string
    status?: string
    data?: string
    mes?: string
}

export async function logoutAccount(): Promise<void> {
    clearChatSession()
    const ws = getOpenChatSocket()
    if (!ws) {
        disconnectChatSocket()
        return
    }

    await new Promise<void>((resolve) => {
        let settled = false
        const timer = window.setTimeout(() => {
            console.warn("Server không phản hồi LOGOUT kịp thời, tiến hành đăng xuất cục bộ.")
            finish()
        }, 5000)

        function finish() {
            if (settled) return
            settled = true
            window.clearTimeout(timer)
            ws?.removeEventListener("message", onMessage)
            ws?.removeEventListener("close", finish)
            ws?.removeEventListener("error", finish)
            disconnectChatSocket()
            resolve()
        }

        function onMessage(message: MessageEvent) {
            if (typeof message.data !== "string") return

            let response: LogoutResponse
            try {
                response = JSON.parse(message.data)
            } catch {
                return
            }

            if (response?.event !== "LOGOUT") return
            if (response.status === "error") {
                console.warn("Server trả lỗi LOGOUT:", response.mes)
            }
            finish()
        }

        ws.addEventListener("message", onMessage)
        ws.addEventListener("close", finish)
        ws.addEventListener("error", finish)

        try {
            ws.send(JSON.stringify({
                action: "onchat",
                data: {
                    event: "LOGOUT",
                },
            }))
        } catch (error) {
            console.warn("Không thể gửi yêu cầu LOGOUT:", error)
            finish()
        }
    })
}