'use client';

import { useEffect, useState } from 'react';
import type { CategorizedMenu } from '@/lib/types';
import { MenuClientLayout } from '@/components/menu-client-layout';
import { useMenu } from '@/context/menu-context';

export default function Home() {
  const {
    menuItems,
    categorizedMenu,
    setCategorizedMenu,
    isCategorizing,
    setIsCategorizing,
  } = useMenu();
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    // Remove the client-side categorization since it's now handled in the context
    if (initialLoad && menuItems.length > 0) {
      setInitialLoad(false);
    }
  }, [initialLoad, menuItems]);

  return <MenuClientLayout />;
}
