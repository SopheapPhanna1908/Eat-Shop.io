'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useMenu } from '@/context/menu-context';

type DeleteCategoryDialogProps = {
  categoryName: string;
};

export function DeleteCategoryDialog({ categoryName }: DeleteCategoryDialogProps) {
  const [open, setOpen] = React.useState(false);
  const { deleteCategory } = useMenu();

  const onDeleteCategory = () => {
    deleteCategory(categoryName);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">Delete</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Category</DialogTitle>
        </DialogHeader>
        <p>Are you sure you want to delete the category "{categoryName}"? This action cannot be undone.</p>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="destructive" onClick={onDeleteCategory}>Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
