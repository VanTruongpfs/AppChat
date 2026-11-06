import AuthField from "./AuthField.tsx";
import type { FormEvent } from "react";
import { connectChatSocket } from "../../services/connectSocket";
import { useAppDispatch, useAppSelector } from "../../app/hook";
import type { AppDispatch } from "../../app/store";
import { logginStart, logginSuccess, logginFail } from "./authSlice";
import { Navigate } from "react-router";
export type AuthMode = 'login' | 'register';
type AuthFormProps = {
    mode : AuthMode;
}
function handleLoginResponse(event: MessageEvent, user: string, dispatch: AppDispatch) {
    if(typeof event.data !== "string") {
        return;
    }
    try {
        const response = JSON.parse(event.data);
        if (response?.event !== "LOGIN") {
            return;
        }
        console.log("Trạng thái đăng nhập", response.status);
        if(response.status ===  "success") {
            const reLoginCode = response.data?.RE_LOGIN_CODE;
            if(typeof reLoginCode !== "string" || reLoginCode.length === 0) {
                console.error("Phản hồi đăng nhập thiếu mã phiên");
                return;
            }
            console.log("Đã nhận mã phiên");
            dispatch(logginSuccess({
                user: user,
                reLoginCode: reLoginCode,
            }));
        }
        if (response.status === "error") {
            let message="Đăng nhập thất bại";
            if(typeof response.mes === "string"){
                message = response.mes;
            }
            dispatch(logginFail(message));
        }
    }catch(error) {
        console.log("Không được file json từ server", error);
    }
}
async function handleSubmit(event: FormEvent<HTMLFormElement>, isRegister: boolean, dispatch: AppDispatch) {
    event.preventDefault();
    if (isRegister) {
        return;
    }
    const formData = new FormData(event.currentTarget);
    const user = String(formData.get("username") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    dispatch(logginStart());
    try{
        const connection = await connectChatSocket();
        connection.onmessage=(messageEvent)  => {
            handleLoginResponse(messageEvent, user, dispatch);
        };
        console.log("WebSocket đã kết nối", connection.readyState===WebSocket.OPEN);
        const request = {
            action: "onchat",
            data:{
                event: "LOGIN",
                data:{
                    user: user,
                    pass: password,
                }
            }
        };
        connection.send(JSON.stringify(request));
    }catch(error){
        console.error("Kết nối thất bại", error);
    }
}
export default function AuthForm({mode}: AuthFormProps) {
    const isRegister = mode === 'register';
    const status = useAppSelector(state => state.auth.status);
    const error = useAppSelector(state => state.auth.error);
    const dispatch = useAppDispatch();
    if (status === "authenticated") {
        return <Navigate to="/chat" replace />;
    }
    return (<>
        <form className="auth-form" onSubmit={(event)=>handleSubmit(event, isRegister, dispatch)}>
            <p>Trạng thái: {status}</p>
            <AuthField id="username"
                       label="Tên người dùng"
                       name="username"
                       type="text"
                       placeholder="Nhập username (a-z, 0-9, _)"
                       autoComplete="username"
                       required
            />
            <AuthField
                id="password"
                label="Mật khẩu"
                name="password"
                type="password"
                placeholder="Nhập mật khẩu"
                autoComplete={
                    isRegister ? 'new-password' : 'current-password'
                }
                required
            />
            {!isRegister && error && (
                <p className="auth-error">{error}</p>
            )}
            {isRegister && (
                <AuthField
                    id="confirm-password"
                    label="Xác nhận mật khẩu"
                    name="confirmPassword"
                    type="password"
                    placeholder="Nhập lại mật khẩu"
                    autoComplete="new-password"
                    required
                />
            )}
            <button className="auth-submit" type="submit">
                {isRegister ? 'Đăng ký tài khoản' : 'Đăng nhập'}
            </button>
        </form>
    </>)
}