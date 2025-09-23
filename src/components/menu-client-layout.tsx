'use client';

import { useState, useMemo, useEffect } from 'react';
import { Header } from './header';
import { MenuDisplay } from './menu-display';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { AppLogo } from '@/components/app-logo';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useMenu } from '@/context/menu-context';
import type { CategorizedMenu } from '@/lib/types';
import { Skeleton } from './ui/skeleton';

export function MenuClientLayout() {
  const { categorizedMenu, isCategorizing } = useMenu();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMenu = useMemo(() => {
    if (!searchQuery) {
      return categorizedMenu;
    }

    const lowercasedQuery = searchQuery.toLowerCase();
    const allItems = Object.values(categorizedMenu).flat();
    const matchingItems = allItems.filter(
      (item) =>
        item.name.toLowerCase().includes(lowercasedQuery) ||
        item.price.toString().includes(lowercasedQuery)
    );

    if (matchingItems.length > 0) {
      return { 'Search Results': matchingItems };
    }

    return {};
  }, [searchQuery, categorizedMenu]);

  const categories = useMemo(() => {
    if (!searchQuery) {
      return Object.keys(categorizedMenu);
    }
    return Object.keys(filteredMenu);
  }, [filteredMenu, categorizedMenu, searchQuery]);

  // Debug logging for development
  useEffect(() => {
    console.log('MenuClientLayout - categorizedMenu:', categorizedMenu);
    console.log('MenuClientLayout - categories:', categories);
    console.log('MenuClientLayout - isCategorizing:', isCategorizing);
  }, [categorizedMenu, categories, isCategorizing]);

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <AppLogo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <nav className="flex flex-col gap-2 p-2">
                {isCategorizing && categories.length === 0 ? (
                  <div className="flex flex-col gap-2 px-2">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                ) : (
                  categories.map((category) => (
                    <Button
                      key={category}
                      variant="ghost"
                      className="justify-start"
                      asChild
                    >
                      <Link href={`#${category.replace(/\s+/g, '-')}`}>
                        <span>{category}</span>
                      </Link>
                    </Button>
                  ))
                )}
              </nav>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col h-screen">
          <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
          <main className="flex-1 overflow-y-auto relative">
            {isCategorizing && categories.length === 0 ? (
              <div className="container mx-auto py-8 px-4 md:px-6">
                <div className="mb-12">
                  <Skeleton className="h-8 w-1/3 mb-6" />
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-64 w-full" />
                  </div>
                </div>
              </div>
            ) : (
              <MenuDisplay categorizedMenu={filteredMenu} />
            )}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
