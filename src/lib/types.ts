export type MenuItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  featured: 'hot' | 'new' | null;
};

export type CategorizedMenu = Record<string, MenuItem[]>;
