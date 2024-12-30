import { NavItem } from '@/types';

export type Product = {
  photo_url: string;
  name: string;
  description: string;
  created_at: string;
  price: number;
  id: number;
  category: string;
  updated_at: string;
};

export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/dashboard/overview',
    icon: 'dashboard',
    isActive: false,
    items: [] // Empty array as there are no child items for Dashboard
  },
  // {
  //   title: 'Transactions',
  //   url: '/dashboard/transactions',
  //   icon: 'dashboard',
  //   isActive: false,
  //   items: [] // Empty array as there are no child items for Dashboard
  // },
  // {
  //   title: 'Company',
  //   url: '/dashboard/company',
  //   icon: 'dashboard',
  //   isActive: false,
  //   items: [] // Empty array as there are no child items for Dashboard
  // },
  // {
  //   title: 'Payments',
  //   url: '/dashboard/company',
  //   icon: 'dashboard',
  //   isActive: false,
  //   items: [] // Empty array as there are no child items for Dashboard
  // },
  // {
  //   title: 'Company profile',
  //   url: '/dashboard/business',
  //   icon: 'billing',
  //   isActive: false,
  //   items: [] // Empty array as there are no child items for Dashboard
  // },
  {
    title: 'Profile',
    url: '/dashboard/profile',
    icon: 'user',
    isActive: false,
    items: [] // No child items
  }
];
