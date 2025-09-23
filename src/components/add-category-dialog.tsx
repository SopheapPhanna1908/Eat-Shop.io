'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMenu } from '@/context/menu-context';

export function AddCategoryDialog() {
  const [open, setOpen] = React.useState(false);
  const [categoryName, setCategoryName] = React.useState('');
  const { addCategory, isSaving } = useMenu();

  const onAddCategory = async () => {
    if (categoryName.trim() !== '') {
      try {
        await addCategory(categoryName.trim());
        setCategoryName('');
        setOpen(false);
      } catch (error) {
        console.error('Failed to add category:', error);
        // You could add a toast here for error feedback
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Category</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Category</DialogTitle>
        </DialogHeader>
        <Input
          type="text"
          placeholder="Category name"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          autoFocus
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSaving}>Cancel</Button>
          <Button onClick={onAddCategory} disabled={isSaving}>
            {isSaving ? 'Adding...' : 'Add'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
