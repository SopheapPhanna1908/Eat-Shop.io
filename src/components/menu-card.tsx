'use client';

import type { MenuItem } from '@/lib/types';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useState } from 'react';
import { ContactDialog } from './contact-dialog';

type MenuCardProps = {
  item: MenuItem;
};

const featuredBadges = {
  hot: (
    <Badge variant="destructive" className="absolute top-3 right-3">
      Hot 🔥
    </Badge>
  ),
  new: (
    <Badge
      variant="default"
      className="absolute top-3 right-3 bg-blue-500 text-white"
    >
      New ✨
    </Badge>
  ),
};

export function MenuCard({ item }: MenuCardProps) {
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);

  // Add null check for item
  if (!item) {
    return null;
  }

  return (
    <>
      <Card className="flex flex-col overflow-hidden shadow-md transition-shadow hover:shadow-lg">
        <CardHeader className="p-0 relative">
          <Image
            src={item.image}
            alt={item.name}
            width={600}
            height={600}
            className="aspect-square object-cover"
            data-ai-hint="food item"
          />
          {item.featured && featuredBadges[item.featured]}
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <CardTitle className="text-lg font-headline mb-1">
            {item.name}
          </CardTitle>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between items-center">
          <p className="text-xl font-bold text-primary">
            ${item.price.toFixed(2)}
          </p>
          <Button
            onClick={() => setIsContactDialogOpen(true)}
            className="bg-accent hover:bg-accent/90 text-accent-foreground h-8 px-3 text-xs"
          >
            Buy Now
          </Button>
        </CardFooter>
      </Card>
      <ContactDialog
        open={isContactDialogOpen}
        onOpenChange={setIsContactDialogOpen}
        item={item}
      />
    </>
  );
}
