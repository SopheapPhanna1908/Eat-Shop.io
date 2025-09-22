'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { MenuItem } from '@/lib/types';
import Image from 'next/image';
import { Facebook, Send, MapPin, Phone } from 'lucide-react';

type ContactDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: MenuItem;
};

const SocialLink = ({ href, children }: { href: string, children: React.ReactNode }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary/20"
  >
    {children}
  </a>
);

export function ContactDialog({ open, onOpenChange, item }: ContactDialogProps) {
  const phoneNumber = '0962404685';
  const facebookUrl = 'https://www.facebook.com/share/1CeAoTNJpX/?mibextid=wwXIfr';
  const telegramUrl = 'https://t.me/phanna168168168';
  const googleMapsUrl = 'https://maps.app.goo.gl/L7Ph1MDgwX2WBAQn9?g_st=ic';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle>Contact to Order</DialogTitle>
        </DialogHeader>
        <div className="p-6 space-y-4">
          <div className="relative aspect-square w-full rounded-lg overflow-hidden">
            <Image
              src={item.image}
              alt={item.name}
              fill
              className="object-cover"
            />
          </div>
          <h3 className="text-xl font-bold font-headline">{item.name}</h3>
          <p className="text-2xl font-bold text-primary">${item.price.toFixed(2)}</p>

          <div className="flex items-center justify-center gap-4 pt-4 flex-wrap">
              <SocialLink href={facebookUrl}><Facebook className="h-5 w-5" /></SocialLink>
              <SocialLink href={telegramUrl}><Send className="h-5 w-5" /></SocialLink>
              <SocialLink href={googleMapsUrl}><MapPin className="h-5 w-5" /></SocialLink>
              <a href={`tel:${phoneNumber}`} className="flex items-center gap-2 text-primary font-semibold">
                  <Phone className="h-5 w-5" />
                  <span>{phoneNumber}</span>
              </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
