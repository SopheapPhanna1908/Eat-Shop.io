'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit } from 'lucide-react';
import type { MenuItem } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useMenu } from '@/context/menu-context';

type EditProductDialogProps = {
  product: MenuItem;
};

export function EditProductDialog({ product }: EditProductDialogProps) {
  const { updateProduct, categories, getCategoryForProduct } = useMenu();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(product.name);
  const [price, setPrice] = useState(product.price.toString());
  const [image, setImage] = useState<string | null>(product.image);
  const [selectedCategory, setSelectedCategory] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setName(product.name);
      setPrice(product.price.toString());
      setImage(product.image);
      setSelectedCategory(getCategoryForProduct(product.id) || '');
    }
  }, [open, product, getCategoryForProduct]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceValue = parseFloat(price);

    if (!name || !price || isNaN(priceValue) || priceValue <= 0) {
      toast({
        title: 'Invalid input',
        description: 'Please fill out all fields with valid data.',
        variant: 'destructive',
      });
      return;
    }

    const updatedProduct = {
      ...product,
      name,
      price: priceValue,
      image: image || 'https://picsum.photos/seed/new/600/400',
    };

    updateProduct(updatedProduct, selectedCategory);

    toast({
      title: 'Product Updated',
      description: 'The product has been successfully updated.',
    });

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Edit className="h-4 w-4" />
          <span className="sr-only">Edit</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update the details for this menu item.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Price
              </Label>
              <Input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Change category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="image" className="text-right pt-2">
                Image
              </Label>
              <div className="col-span-3 flex flex-col gap-2">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="col-span-3"
                />
                {image && (
                  <div className="relative mt-2 h-24 w-24 rounded-md border">
                    <Image
                      src={image}
                      alt="Preview"
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
