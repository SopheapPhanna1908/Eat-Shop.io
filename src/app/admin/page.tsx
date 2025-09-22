'use client';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AddProductDialog } from '@/components/add-product-dialog';
import { AddCategoryDialog } from '@/components/add-category-dialog';
import { LogOut, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog';
import { EditProductDialog } from '@/components/edit-product-dialog';
import { EditCategoryDialog } from '@/components/edit-category-dialog';
import { useMenu } from '@/context/menu-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminPage() {
  const { menuItems, deleteProduct, categories, deleteCategory } = useMenu();
  const { toast } = useToast();
  const router = useRouter();

  const handleLogout = () => {
    router.push('/login');
  };

  const handleDeleteProduct = (productId: string) => {
    deleteProduct(productId);
    toast({
      title: 'Product Deleted',
      description: 'The product has been successfully removed.',
    });
  };

  const handleDeleteCategory = (categoryName: string) => {
    deleteCategory(categoryName);
    toast({
      title: 'Category Deleted',
      description: `The category "${categoryName}" has been removed.`,
    });
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your products and categories.
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button asChild className="flex-1 md:flex-initial">
            <Link href="/">Back to Shop</Link>
          </Button>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="flex-1 md:flex-initial"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="space-y-12">
        {/* Product Management */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Products</h2>
            <AddProductDialog />
          </div>
          {/* Mobile View */}
          <div className="md:hidden space-y-4">
            {menuItems.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <CardTitle>{item.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-between items-center">
                  <p className="font-medium">${item.price.toFixed(2)}</p>
                  <div className="flex gap-2">
                    <EditProductDialog product={item} />
                    <DeleteConfirmationDialog
                      onConfirm={() => handleDeleteProduct(item.id)}
                    >
                      <Button variant="destructive" size="icon">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </DeleteConfirmationDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {/* Desktop View */}
          <div className="hidden md:block border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {menuItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>${item.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <EditProductDialog product={item} />
                        <DeleteConfirmationDialog
                          onConfirm={() => handleDeleteProduct(item.id)}
                        >
                          <Button variant="destructive" size="icon">
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </DeleteConfirmationDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>

        {/* Category Management */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Categories</h2>
            <AddCategoryDialog />
          </div>
          {/* Mobile View */}
          <div className="md:hidden space-y-4">
            {categories.map((category) => (
              <Card key={category}>
                <CardContent className="flex justify-between items-center pt-6">
                  <p className="font-medium">{category}</p>
                  <div className="flex gap-2">
                    <EditCategoryDialog categoryName={category} />
                    <DeleteConfirmationDialog
                      onConfirm={() => handleDeleteCategory(category)}
                    >
                      <Button variant="destructive" size="icon">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </DeleteConfirmationDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {/* Desktop View */}
          <div className="hidden md:block border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category}>
                    <TableCell className="font-medium">{category}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <EditCategoryDialog categoryName={category} />
                        <DeleteConfirmationDialog
                          onConfirm={() => handleDeleteCategory(category)}
                        >
                          <Button variant="destructive" size="icon">
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </DeleteConfirmationDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      </main>
    </div>
  );
}
