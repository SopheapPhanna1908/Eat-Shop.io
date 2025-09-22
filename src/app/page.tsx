'use client';

import { useEffect, useState } from 'react';
import type { CategorizedMenu } from '@/lib/types';
import { MenuClientLayout } from '@/components/menu-client-layout';
import { categorizeMenuItems } from '@/ai/flows/categorize-menu-items';
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
    // Only run AI categorization if the menu isn't already categorized in localStorage
    const runAICategorization = async () => {
      if (Object.keys(categorizedMenu).length > 0 && !isCategorizing) {
        return;
      }
      setIsCategorizing(true);
      try {
        const categorizedFromAI = await categorizeMenuItems(
          menuItems.map(({ name }) => ({ name, description: '' })) // Passing empty description
        );

        const findFullMenuItem = (name: string) =>
          menuItems.find((item) => item.name === name);

        const newCategorizedMenu = Object.entries(categorizedFromAI).reduce(
          (acc, [category, items]) => {
            const fullItems = items
              .map((item: { name: string }) => findFullMenuItem(item.name))
              .filter((item): item is (typeof menuItems)[0] => !!item);

            if (fullItems.length > 0) {
              acc[category] = fullItems;
            }
            return acc;
          },
          {} as CategorizedMenu
        );
        setCategorizedMenu(newCategorizedMenu);
      } catch (error) {
        console.error('Error categorizing menu items with AI:', error);
        // Fallback to default categorization on error is handled in context
      } finally {
        setIsCategorizing(false);
        setInitialLoad(false);
      }
    };

    if (initialLoad && menuItems.length > 0) {
      runAICategorization();
    }
  }, [
    initialLoad,
    menuItems,
    categorizedMenu,
    setCategorizedMenu,
    setIsCategorizing,
    isCategorizing,
  ]);

  return <MenuClientLayout />;
}
