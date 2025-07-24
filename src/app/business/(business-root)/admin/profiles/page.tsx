import { isUserAdminAction } from '@/actions/session';
import { redirect } from 'next/navigation';
import Config from '@/cw/community.json';
import { CommunityConfig, getProfileFromUsername } from '@citizenwallet/sdk';
import ProfileSearch from './profile-search';

export default async function Profiles({
  searchParams
}: {
  searchParams: Promise<{ username?: string }>;
}) {
  const isAdmin = await isUserAdminAction();
  if (!isAdmin) {
    redirect('/');
  }

  const { username } = await searchParams;
  let profile = null;
  let error = null;

  if (username) {
    const ipfsDomain = process.env.IPFS_DOMAIN;
    if (!ipfsDomain) {
      error = 'IPFS domain not configured';
    } else {
      try {
        const community = new CommunityConfig(Config);
        profile = await getProfileFromUsername(ipfsDomain, community, username);
      } catch (err) {
        console.error('Error fetching profile:', err);
        error = 'Failed to fetch profile';
      }
    }
  }

  return (
    <ProfileSearch
      username={username}
      initialProfile={profile}
      initialError={error}
    />
  );
}
