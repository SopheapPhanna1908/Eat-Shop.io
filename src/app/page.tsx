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
    // Simple client-side categorization fallback for static export
    const runSimpleCategorization = () => {
      if (Object.keys(categorizedMenu).length > 0 && !isCategorizing) {
        return;
      }
      setIsCategorizing(true);

      try {
        // Simple categorization logic for static export
        const newCategorizedMenu: CategorizedMenu = {};

        menuItems.forEach((item) => {
          const name = item.name.toLowerCase();

          // Simple categorization based on keywords
          let category = 'Other';
          if (name.includes('burger') || name.includes('pizza') || name.includes('sandwich')) {
            category = 'Main Courses';
          } else if (name.includes('fries') || name.includes('wings') || name.includes('appetizer')) {
            category = 'Appetizers';
          } else if (name.includes('cake') || name.includes('ice cream') || name.includes('dessert')) {
            category = 'Desserts';
          } else if (name.includes('coffee') || name.includes('tea') || name.includes('juice') || name.includes('soda')) {
            category = 'Beverages';
          }

          if (!newCategorizedMenu[category]) {
            newCategorizedMenu[category] = [];
          }
          newCategorizedMenu[category].push(item);
        });

        setCategorizedMenu(newCategorizedMenu);
      } catch (error) {
        console.error('Error categorizing menu items:', error);
        // Fallback: put all items in "All Items" category
        setCategorizedMenu({ 'All Items': menuItems });
      } finally {
        setIsCategorizing(false);
        setInitialLoad(false);
      }
    };

    if (initialLoad && menuItems.length > 0) {
      runSimpleCategorization();
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
