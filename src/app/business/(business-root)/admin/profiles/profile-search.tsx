'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, User, UserX, Copy, Check, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { deleteProfileAction, getProfile } from './action';
import { ProfileWithTokenId } from '@citizenwallet/sdk';

interface Profile {
  account: string;
  description: string;
  image: string;
  image_medium: string;
  image_small: string;
  name: string;
  username: string;
}

interface ProfileSearchProps {
  username?: string;
  initialProfile?: ProfileWithTokenId | null;
  initialError?: string | null;
}

export default function ProfileSearch({
  username,
  initialProfile,
  initialError
}: ProfileSearchProps) {
  const t = useTranslations('profileSearch');
  const router = useRouter();
  const searchParams = useSearchParams();

  const previousUsernameRef = useRef(username);

  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  const [enteredUsername, setEnteredUsername] = useState(username || '');
  const [profile, setProfile] = useState<ProfileWithTokenId | null>(
    initialProfile || null
  );
  const [error, setError] = useState<string | null>(initialError || null);

  useEffect(() => {
    if (!!username && username !== previousUsernameRef.current) {
      setLoading(true);
      getProfile(username)
        .then((profile) => {
          setProfile(profile);
          setLoading(false);
        })
        .catch((error) => {
          setError(error.message);
          setProfile(null);
          setLoading(false);
        });
      previousUsernameRef.current = username;
    }
  }, [username]);

  const handleSearch = () => {
    if (!enteredUsername.trim()) return;
    if (enteredUsername.trim() === username) return;
    setLoading(true);

    // Navigate to the same page with the new username as search param
    const params = new URLSearchParams();
    params.set('username', enteredUsername.trim());
    router.push(`/business/admin/profiles?${params.toString()}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClear = () => {
    setEnteredUsername('');
    setProfile(null);
    setError(null);
    router.push('/business/admin/profiles');
  };

  const handleCopyJson = async () => {
    if (profile) {
      try {
        await navigator.clipboard.writeText(JSON.stringify(profile, null, 2));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy JSON:', err);
      }
    }
  };

  const handleDelete = async () => {
    if (profile) {
      const confirm = window.confirm(t('areYouSureYouWantToDelete'));
      if (!confirm) return;

      setDeleting(true);

      await deleteProfileAction(profile);

      setError(null);
      setProfile(null);
      setLoading(false);
      setEnteredUsername('');

      router.push(`/business/admin/profiles`);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
        <Button
          onClick={() => router.push('/business/admin/profiles/create')}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Profile
        </Button>
      </div>

      {/* Search Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            {t('searchProfile')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder={t('enterUsername')}
                value={enteredUsername}
                onChange={(e) => setEnteredUsername(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={!enteredUsername.trim() || loading}
              className="min-w-[100px]"
            >
              {t('search')}{' '}
              {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            </Button>
            {username && (
              <Button
                onClick={handleClear}
                variant="outline"
                className="min-w-[100px]"
              >
                {t('clear')}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8 text-center">
              <div className="flex flex-col items-center gap-3">
                <UserX className="h-12 w-12 text-destructive" />
                <div>
                  <h3 className="text-lg font-semibold text-destructive">
                    Error
                  </h3>
                  <p className="text-muted-foreground">{error}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profile Not Found */}
      {searchParams.get('username') && !profile && !error && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8 text-center">
              <div className="flex flex-col items-center gap-3">
                <UserX className="h-12 w-12 text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-semibold">
                    {t('profileNotFound')}
                  </h3>
                  <p className="text-muted-foreground">
                    {t('noProfileFoundFor')}{' '}
                    <span className="font-mono">
                      {searchParams.get('username')}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profile Display */}
      {profile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {t('profileFound')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Profile Image */}
              <div className="flex flex-col items-center">
                <Avatar className="mb-4 h-32 w-32">
                  <AvatarImage src={profile.image} alt={profile.name} />
                  <AvatarFallback className="text-2xl">
                    {profile.name?.charAt(0) ||
                      profile.username?.charAt(0) ||
                      'U'}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Profile Details */}
              <div className="space-y-4 md:col-span-2">
                <div>
                  <h3 className="text-2xl font-bold">{profile.name}</h3>
                  <Badge variant="secondary" className="mt-1">
                    @{profile.username}
                  </Badge>
                </div>

                {profile.description && (
                  <div>
                    <h4 className="mb-2 font-semibold">{t('description')}</h4>
                    <p className="text-muted-foreground">
                      {profile.description}
                    </p>
                  </div>
                )}

                <div>
                  <h4 className="mb-2 font-semibold">{t('accountAddress')}</h4>
                  <code className="rounded bg-muted px-2 py-1 text-sm">
                    {profile.account}
                  </code>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {t('delete')}
              {deleting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Raw JSON Display */}
      {profile && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{t('rawJson')}</span>
              <Button
                onClick={handleCopyJson}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-green-600" />
                    {t('copied')}
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    {t('copyJson')}
                  </>
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="max-h-96 overflow-auto rounded bg-muted p-4 text-sm">
              <code>{JSON.stringify(profile, null, 2)}</code>
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
