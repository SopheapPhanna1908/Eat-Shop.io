import { EatShopLogo } from '@/components/eat-shop-logo';

export function AppLogo() {
  return (
    <div className="flex items-center gap-2">
      <EatShopLogo className="h-8 w-auto" />
      <h1 className="text-lg font-bold font-headline text-primary">Eat Shop</h1>
    </div>
  );
}
