'use client';
import PageContainer from '@/components/layout/page-container';
import ProfileCreateForm from './profile-create-form';
import axios from 'axios';
import useSWR from 'swr';

export default function ProfileViewPage() {
  const { data: me } = useSWR('/api/me', async () => {
    const response = await axios.get('/api/me');
    return response.data;
  });

  return (
    <PageContainer>
      <div className="space-y-4">
        {me && <ProfileCreateForm initialData={me?.user} />}
      </div>
    </PageContainer>
  );
}
