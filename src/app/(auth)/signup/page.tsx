import { SignUpForm } from '@/features/auth/components/signup-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sign Up - PM Tool MVP',
    description: 'Create a new PM Tool account',
};

export default function SignUpPage() {
    return <SignUpForm />;
}
