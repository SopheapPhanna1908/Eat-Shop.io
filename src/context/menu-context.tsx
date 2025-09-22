'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from 'react';
import type { MenuItem, CategorizedMenu } from '@/lib/types';
import { menuItems as initialMenuItems } from '@/lib/data';

type MenuContextType = {
  menuItems: MenuItem[];
  addProduct: (newProduct: Omit<MenuItem, 'id'>, category: string) => void;
  updateProduct: (updatedProduct: MenuItem, newCategory?: string) => void;
  deleteProduct: (productId: string) => void;
  categories: string[];
  addCategory: (categoryName: string) => void;
  updateCategory: (oldName: string, newName: string) => void;
  deleteCategory: (categoryName: string) => void;
  categorizedMenu: CategorizedMenu;
  setCategorizedMenu: (menu: CategorizedMenu) => void;
  getCategoryForProduct: (productId: string) => string | undefined;
  isCategorizing: boolean;
  setIsCategorizing: (isLoading: boolean) => void;
};

const MenuContext = createContext<MenuContextType | undefined>(undefined);

const initialCategories = [
  'Apparel',
  'Footwear',
  'Appetizers',
  'Beverages',
  'Desserts',
];

export const MenuProvider = ({ children }: { children: ReactNode }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [categorizedMenu, setCategorizedMenu] = useState<CategorizedMenu>({});
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const storedMenuItems = localStorage.getItem('menuItems');
      const storedCategories = localStorage.getItem('categories');
      const storedCategorizedMenu = localStorage.getItem('categorizedMenu');

      if (storedMenuItems) {
        setMenuItems(JSON.parse(storedMenuItems));
      } else {
        setMenuItems(initialMenuItems);
      }

      if (storedCategories) {
        setCategories(JSON.parse(storedCategories));
      } else {
        setCategories(initialCategories);
      }

      if (storedCategorizedMenu) {
        setCategorizedMenu(JSON.parse(storedCategorizedMenu));
      } else {
        // Build initial categorized menu if not in storage
        const initialMenu: CategorizedMenu = {
          'Apparel': initialMenuItems.filter((item) =>
            ['T-Shirt', 'Jeans', 'Shirt'].some((keyword) =>
              item.name.includes(keyword)
            )
          ),
          'Footwear': initialMenuItems.filter((item) =>
            ['Sneakers', 'Boots', 'Loafers'].some((keyword) =>
              item.name.includes(keyword)
            )
          ),
          'Appetizers': initialMenuItems.filter((item) =>
            ['Calamari', 'Cheese Board', 'Crispy Rice'].some((keyword) =>
              item.name.includes(keyword)
            )
          ),
          'Beverages': initialMenuItems.filter((item) =>
            ['Lemonade', 'Latte', 'Coffee'].some((keyword) =>
              item.name.includes(keyword)
            )
          ),
        };
        setCategorizedMenu(initialMenu);
      }
    } catch (error) {
      // If localStorage is not available or parsing fails, use initial data
      console.error('Failed to access localStorage:', error);
      setMenuItems(initialMenuItems);
      setCategories(initialCategories);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem('menuItems', JSON.stringify(menuItems));
        localStorage.setItem('categories', JSON.stringify(categories));
        localStorage.setItem(
          'categorizedMenu',
          JSON.stringify(categorizedMenu)
        );
      } catch (error) {
        console.error('Failed to save to localStorage:', error);
      }
    }
  }, [menuItems, categories, categorizedMenu, isInitialized]);

  const getCategoryForProduct = useCallback(
    (productId: string): string | undefined => {
      for (const category in categorizedMenu) {
        if (categorizedMenu[category].some((item) => item.id === productId)) {
          return category;
        }
      }
      return undefined;
    },
    [categorizedMenu]
  );

  const addProduct = (newProduct: Omit<MenuItem, 'id'>, category: string) => {
    const fullNewProduct: MenuItem = {
      ...newProduct,
      id: `new-${Date.now()}`,
    };
    setMenuItems((prev) => [...prev, fullNewProduct]);
    setCategorizedMenu((prev) => {
      const newMenu = { ...prev };
      if (!newMenu[category]) {
        newMenu[category] = [];
      }
      newMenu[category].push(fullNewProduct);
      return newMenu;
    });
  };

  const updateProduct = (updatedProduct: MenuItem, newCategory?: string) => {
    setMenuItems((prev) =>
      prev.map((item) =>
        item.id === updatedProduct.id ? updatedProduct : item
      )
    );
    // Move item to a new category if specified
    setCategorizedMenu((prev) => {
      const newMenu = { ...prev };
      let itemToMove: MenuItem | undefined;
      let oldCategory: string | undefined;

      // Find and remove the item from its old category
      for (const category in newMenu) {
        const itemIndex = newMenu[category].findIndex(
          (item) => item.id === updatedProduct.id
        );
        if (itemIndex > -1) {
          itemToMove = newMenu[category][itemIndex];
          oldCategory = category;
          // If category is not changing, just update item in place
          if (newCategory === oldCategory || !newCategory) {
            newMenu[category][itemIndex] = updatedProduct;
            return newMenu;
          }
          newMenu[category].splice(itemIndex, 1);
          if (newMenu[category].length === 0) {
            delete newMenu[category];
          }
          break;
        }
      }

      // Add the item to its new category
      if (itemToMove && newCategory) {
        if (!newMenu[newCategory]) {
          newMenu[newCategory] = [];
        }
        newMenu[newCategory].push(updatedProduct);
      }
      return newMenu;
    });
  };

  const deleteProduct = (productId: string) => {
    setMenuItems((prev) => prev.filter((item) => item.id !== productId));
    setCategorizedMenu((prev) => {
      const newMenu = { ...prev };
      for (const category in newMenu) {
        newMenu[category] = newMenu[category].filter(
          (item) => item.id !== productId
        );
        if (newMenu[category].length === 0) {
          delete newMenu[category];
        }
      }
      return newMenu;
    });
  };

  const addCategory = (categoryName: string) => {
    if (!categories.includes(categoryName)) {
      setCategories((prev) => [...prev, categoryName]);
      setCategorizedMenu((prev) => ({
        ...prev,
        [categoryName]: [],
      }));
    }
  };

  const updateCategory = (oldName: string, newName: string) => {
    if (oldName === newName) return;
    setCategories((prev) =>
      prev.map((cat) => (cat === oldName ? newName : cat))
    );
    setCategorizedMenu((prev) => {
      const newMenu = { ...prev };
      if (newMenu[oldName]) {
        newMenu[newName] = newMenu[oldName];
        delete newMenu[oldName];
      }
      return newMenu;
    });
  };

  const deleteCategory = (categoryName: string) => {
    const itemsInCategory = categorizedMenu[categoryName] || [];
    const itemIdsInCategory = itemsInCategory.map((item) => item.id);

    setMenuItems((prev) =>
      prev.filter((item) => !itemIdsInCategory.includes(item.id))
    );
    setCategories((prev) => prev.filter((cat) => cat !== categoryName));

    setCategorizedMenu((prev) => {
      const newMenu = { ...prev };
      delete newMenu[categoryName];
      return newMenu;
    });
  };

  return (
    <MenuContext.Provider
      value={{
        menuItems,
        addProduct,
        updateProduct,
        deleteProduct,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        categorizedMenu,
        setCategorizedMenu,
        getCategoryForProduct,
        isCategorizing,
        setIsCategorizing,
      }}
    >
      {children}
    </MenuContext.Provider>
  );
};

export const useMenu = () => {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
};
