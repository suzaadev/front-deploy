'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SlugWalletsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect unknown routes to home page
    // Merchant storefronts are only available at /recipient/[slug]
    router.replace('/');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--suzaa-surface-subtle)]">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--suzaa-blue)]/20 border-t-[var(--suzaa-blue)]" />
    </div>
  );
}
