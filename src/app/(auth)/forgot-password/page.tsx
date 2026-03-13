import { ForgotPasswordForm } from '@/features/auth/components/forgot-password-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Forgot Password - PM Tool MVP',
    description: 'Reset your PM Tool account password',
};

export default function ForgotPasswordPage() {
    return <ForgotPasswordForm />;
}
