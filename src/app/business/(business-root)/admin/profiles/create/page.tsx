import { isUserAdminAction } from '@/actions/session';
import { redirect } from 'next/navigation';
import CreateProfileForm from './create-profile-form';

export default async function CreateProfile() {
  const isAdmin = await isUserAdminAction();
  if (!isAdmin) {
    redirect('/');
  }

  return (
    <div className="container mx-auto py-8 h-full overflow-y-auto">
      <CreateProfileForm />
    </div>
  );
} 