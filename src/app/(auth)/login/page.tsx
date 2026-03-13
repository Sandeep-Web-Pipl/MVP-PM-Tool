import { LoginForm } from '@/features/auth/components/login-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Login - PM Tool MVP',
    description: 'Log in to your PM Tool account',
};

export default function LoginPage() {
    return <LoginForm />;
}
