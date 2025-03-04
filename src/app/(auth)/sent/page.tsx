import { Metadata } from 'next';
import SignInViewPage from '../_components/signin-view';
import MagicLinkSent from '../_components/magic-link-sent';

export const metadata: Metadata = {
  title: 'Authentication | Sign In',
  description: 'Sign In page for authentication.'
};

export default function Page() {
  return (
    <>
      <MagicLinkSent />
    </>
  );
}
