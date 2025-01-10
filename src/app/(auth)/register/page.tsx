import { Metadata } from 'next';
import RegisterView from '@/app/(auth)/_components/register-view';

export const metadata: Metadata = {
  title: 'Authentication | Sign Up',
  description: 'Sign Up page for authentication.'
};

export default function Page() {
  return <RegisterView />;
}
