import AuthField from "./AuthField.tsx";
export type AuthMode = 'login' | 'register';
type AuthFormProps = {
    mode : AuthMode;
}
export default function AuthForm({mode}: AuthFormProps) {
    const isRegister = mode === 'register';
    return (<>
        <form className="auth-form" onSubmit={(event) => event.preventDefault()}>
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