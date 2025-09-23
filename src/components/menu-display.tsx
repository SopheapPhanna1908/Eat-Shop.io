'use client';
import type { CategorizedMenu } from '@/lib/types';
import { MenuCard } from './menu-card';
import { Separator } from './ui/separator';
import { menuItems } from '@/lib/data';

type MenuDisplayProps = {
  categorizedMenu: CategorizedMenu;
};

export function MenuDisplay({ categorizedMenu }: MenuDisplayProps) {
  // Add null check for categorizedMenu
  if (!categorizedMenu) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <h2 className="text-2xl font-bold mb-2">No Menu Available</h2>
        <p className="text-muted-foreground">
          Menu data is loading...
        </p>
      </div>
    );
  }

  const categories = Object.keys(categorizedMenu);



  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      {categories.map((category, index) => {
        const items = categorizedMenu[category];
        if (!items || items.length === 0) return null;

        return (
          <section
            key={category}
            id={category.replace(/\s+/g, '-')}
            className="mb-12 scroll-mt-20"
          >
            <h2 className="text-3xl font-bold font-headline mb-2 px-2 md:px-0">{category}</h2>
            <Separator className="mb-6" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {items.map((item) => (
                <MenuCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
