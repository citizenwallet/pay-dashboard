import React from 'react';
import { render } from '@testing-library/react';

// Mock the auth module
jest.mock('@/auth', () => ({
  auth: jest.fn().mockResolvedValue({
    user: { id: '123', name: 'Test User' }
  })
}));

// Mock the action
jest.mock('@/app/action', () => ({
  getPlaceAction: jest.fn().mockResolvedValue({
    busid: '456',
    lastId: '789'
  })
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
  useRouter: () => ({
    push: jest.fn()
  }),
  usePathname: () => '/'
}));

// Import the component after mocking its dependencies
import HomePage from '@/app/page';
import { redirect } from 'next/navigation';

describe('HomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('redirects to login when user is not authenticated', async () => {
    // Override the auth mock for this test
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const authMock = require('@/auth').auth;
    authMock.mockResolvedValueOnce(null);

    // Render the component
    await HomePage();

    // Check that redirect was called with the correct path
    expect(redirect).toHaveBeenCalledWith('/login');
  });

  it('redirects to business page when user is authenticated', async () => {
    // Render the component
    await HomePage();

    // Check that redirect was called with the correct path
    expect(redirect).toHaveBeenCalledWith('/business/456/places/789/orders');
  });
});
