import { Metadata } from 'next';
import ConfirmSignup from '@/app/(auth)/_components/confirm-signup';

export const metadata: Metadata = {
  title: 'Authentication | Sign In',
  description: 'Sign In page for authentication.'
};

export default function Page() {
  return (
    <>
      <ConfirmSignup />
    </>
  );
}
