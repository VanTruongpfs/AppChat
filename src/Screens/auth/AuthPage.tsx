import AuthTabs from '../../components/auth/AuthTabs'
import AuthForm, {type AuthMode} from '../../components/auth/AuthForm'
import '../../styles/css/AuthPage.scss'

type AuthPageProps = {
    mode: AuthMode
}

export default function AuthPage({ mode }: AuthPageProps) {
    return (
        <main className="auth-page">
            <section className="auth-card" aria-labelledby="auth-title">
                <header className="auth-header">
                    <h1 id="auth-title">NLU Chat App</h1>
                    <p>Hệ thống trò chuyện thời gian thực</p>
                </header>
                <AuthTabs />
                <AuthForm key={mode} mode={mode} />
            </section>
        </main>
    )
}