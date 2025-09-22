'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMenu } from '@/context/menu-context';

type EditCategoryDialogProps = {
  categoryName: string;
};

export function EditCategoryDialog({ categoryName }: EditCategoryDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [newCategoryName, setNewCategoryName] = React.useState(categoryName);
  const { updateCategory } = useMenu();

  const onUpdateCategory = () => {
    if (newCategoryName.trim() !== '' && newCategoryName !== categoryName) {
      updateCategory(categoryName, newCategoryName.trim());
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Edit</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
        </DialogHeader>
        <Input
          type="text"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          autoFocus
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={onUpdateCategory}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
