import AuthField from "./AuthField.tsx";
import type { FormEvent } from "react";
import { connectChatSocket } from "../../services/connectSocket";
import { useAppDispatch, useAppSelector } from "../../app/hook";
import type { AppDispatch } from "../../app/store";
import { logginStart, logginSuccess, logginFail,registerSuccess } from "./authSlice";
import { Navigate } from "react-router";
export type AuthMode = 'login' | 'register';
type AuthFormProps = {
    mode : AuthMode;
}
function handleAuthResponse(event: MessageEvent, user: string, dispatch: AppDispatch) {
    if(typeof event.data !== "string") {
        return;
    }
    try {
        const response = JSON.parse(event.data);
        if (response?.event === "REGISTER") {
            if(response.status === "success") {
                dispatch(registerSuccess());
            }else if(response.status === "error") {
                dispatch(logginFail(
                    typeof response.mes === "string" ? response.mes : "Đăng ký thất bại",
                ));
            }
            return;
        }
        if(response?.event !== "LOGIN") {
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
    const formData = new FormData(event.currentTarget);
    const user = String(formData.get("username") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const passwordConfirm = String(formData.get("confirmPassword") ?? "");
    if(isRegister) {
        if(!/^[a-zA-Z0-9_]+$/.test(user)) {
            dispatch(logginFail(
               "Tên đăng nhập chỉ chứa chữ cái, số và dấu gạch dưới!"
            ));
            return;
        }
        if(password!==passwordConfirm) {
            dispatch(logginFail("Mật khẩu không trùng khớp."))
            return
        }
    }
    dispatch(logginStart());
    try{
        const connection = await connectChatSocket();
        connection.onmessage=(messageEvent)  => {
            handleAuthResponse(messageEvent, user, dispatch);
        };
        console.log("WebSocket đã kết nối", connection.readyState===WebSocket.OPEN);
        const request = {
            action: "onchat",
            data:{
                event: isRegister?"REGISTER":"LOGIN",
                data:{
                    user: user,
                    pass: password,
                }
            }
        };
        connection.send(JSON.stringify(request));
    }catch(error){
        console.error("Kết nối thất bại", error);
        dispatch(logginFail(
            error instanceof Error ? error.message : "Kết nối thất bại",
        ));
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
            {error && (
                <p className="auth-error" role="alert">{error}</p>
            )}

            {isRegister && status === "registered" && (
                <p role="status">
                    Đăng ký thành công
                </p>
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
            <button className="auth-submit" type="submit" disabled={status === "loading"}>
                {isRegister ? 'Đăng ký tài khoản' : 'Đăng nhập'}
            </button>
        </form>
    </>)
}