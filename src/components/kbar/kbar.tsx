'use client';
import { navItems } from '@/constants/data';
import {
  type Action,
  KBarAnimator,
  KBarPortal,
  KBarPositioner,
  KBarProvider,
  KBarSearch
} from 'kbar';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import RenderResults from './render-result';
import useThemeSwitching from './use-theme-switching';

type Result = {
  guideid: string;
  title: string;
  description: string;
  url: string;
};

export default function KBar({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [search, setSearch] = useState('electrolux');
  const [actions, setActions] = useState<Action[]>([]);
  const { data } = useSWR(`/api/search?search=${search}`, (url: string) =>
    fetch(url).then((res) => res.json())
  );

  const navigateTo = (url: string) => {
    router.push(url);
  };

  // These action are for the navigation
  const loadActions = async () => {
    let searchData: Action[] = [];

    if (data?.results) {
      console.log('data', data.results);
      searchData = data?.results?.map((result: Result) => ({
        id: `${result.guideid}Action`,
        name: result.title,
        shortcut: [],
        keywords: [result.title.toLowerCase()],
        section: 'Search',
        subtitle: `Go to ${result.title}`,
        perform: () => navigateTo(`/dashboard/guides/${result.guideid}`)
      }));
    }

    const items = [
      ...(searchData || []),
      ...navItems.flatMap((navItem) => {
        // Only include base action if the navItem has a real URL and is not just a container
        const baseAction =
          navItem.url !== '#'
            ? {
                id: `${navItem.title.toLowerCase()}Action`,
                name: navItem.title,
                keywords: navItem.title.toLowerCase(),
                section: 'Navigation',
                subtitle: `Go to ${navItem.title}`,
                perform: () => navigateTo(navItem.url)
              }
            : null;

        // Map child items into actions
        const childActions =
          navItem.items?.map((childItem) => ({
            id: `${childItem.title.toLowerCase()}Action`,
            name: childItem.title,
            keywords: childItem.title.toLowerCase(),
            section: navItem.title,
            subtitle: `Go to ${childItem.title}`,
            perform: () => navigateTo(childItem.url)
          })) ?? [];

        // Return only valid actions (ignoring null base actions for containers)
        return baseAction ? [baseAction, ...childActions] : childActions;
      })
    ];

    setActions(items);
  };

  useEffect(() => {
    loadActions();
  }, [search]);

  return (
    <KBarProvider
      options={{
        callbacks: {
          onQueryChange: (query) => {
            setSearch(query);
          },
          onOpen: () => {
            loadActions();
          }
        }
      }}
      actions={actions}
    >
      <KBarComponent>{children}</KBarComponent>
    </KBarProvider>
  );
}
const KBarComponent = ({ children }: { children: React.ReactNode }) => {
  useThemeSwitching();

  return (
    <>
      <KBarPortal>
        <KBarPositioner className="scrollbar-hide fixed inset-0 z-[99999] bg-black/80  !p-0 backdrop-blur-sm">
          <KBarAnimator className="relative !mt-64 w-full max-w-[600px] !-translate-y-12 overflow-hidden rounded-lg border bg-background text-foreground shadow-lg">
            <div className="bg-background">
              <div className="border-x-0 border-b-2">
                <KBarSearch className="w-full border-none bg-background px-6 py-4 text-lg outline-none focus:outline-none focus:ring-0 focus:ring-offset-0" />
              </div>
              <RenderResults />
            </div>
          </KBarAnimator>
        </KBarPositioner>
      </KBarPortal>
      {children}
    </>
  );
};
