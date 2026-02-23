import AuthForm from '@/components/auth/AuthForm'

export default function SignupPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <AuthForm mode="signup" />
    </main>
  )
}
