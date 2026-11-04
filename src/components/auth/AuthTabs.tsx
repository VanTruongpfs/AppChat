import { NavLink } from 'react-router'

export default function AuthTabs() {
    return (
        <nav className="auth-tabs" aria-label="Tài khoản">
            <NavLink to="/login" className="auth-tab" end>
                Đăng nhập
            </NavLink>
            <NavLink to="/register" className="auth-tab" end>
                Đăng ký
            </NavLink>
        </nav>
    )
}