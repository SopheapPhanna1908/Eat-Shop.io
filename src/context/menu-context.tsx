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
  addProduct: (newProduct: Omit<MenuItem, 'id'>, category: string) => Promise<void>;
  updateProduct: (updatedProduct: MenuItem, newCategory?: string) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  categories: string[];
  addCategory: (categoryName: string) => Promise<void>;
  updateCategory: (oldName: string, newName: string) => Promise<void>;
  deleteCategory: (categoryName: string) => Promise<void>;
  categorizedMenu: CategorizedMenu;
  setCategorizedMenu: (menu: CategorizedMenu) => void;
  getCategoryForProduct: (productId: string) => string | undefined;
  isCategorizing: boolean;
  setIsCategorizing: (isLoading: boolean) => void;
  isSaving: boolean;
};

const MenuContext = createContext<MenuContextType | undefined>(undefined);

const initialCategories: string[] = ['Apparel', 'Footwear', 'Appetizers', 'Beverages', 'Desserts'];

const loadData = async () => {
  try {
    const response = await fetch('/api/menu');
    if (response.ok) {
      const data = await response.json();
      return {
        menuItems: data.menuItems || initialMenuItems,
        categories: data.categories || initialCategories,
        categorizedMenu: data.categorizedMenu || {},
      };
    }
  } catch (error) {
    console.error('Failed to load data:', error);
  }
  return {
    menuItems: initialMenuItems,
    categories: initialCategories,
    categorizedMenu: {},
  };
};

const saveData = async (menuItems: MenuItem[], categories: string[], categorizedMenu: Record<string, MenuItem[]>, retryCount = 0) => {
  const maxRetries = 3;
  try {
    const response = await fetch('/api/menu', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ menuItems, categories, categorizedMenu }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log('Data saved successfully');
  } catch (error) {
    console.error(`Failed to save data (attempt ${retryCount + 1}):`, error);

    if (retryCount < maxRetries) {
      console.log(`Retrying save operation... (${retryCount + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
      return saveData(menuItems, categories, categorizedMenu, retryCount + 1);
    } else {
      console.error('Max retries reached. Failed to save data.');
      throw error;
    }
  }
};

const buildCategorizedMenu = (menuItems: MenuItem[], categories: string[]) => {
  const categorizedMenu: CategorizedMenu = {};

  // Create categories based on existing categories list
  categories.forEach(category => {
    categorizedMenu[category] = [];
  });

  // Assign items to categories based on keywords
  menuItems.forEach(item => {
    const itemName = item.name.toLowerCase();
    let assigned = false;

    if (['t-shirt', 'jeans', 'shirt', 'denim', 'linen', 'button-up', 'crewneck'].some(keyword => itemName.includes(keyword))) {
      categorizedMenu['Apparel'].push(item);
      assigned = true;
    } else if (['sneakers', 'boots', 'loafers', 'ankle boots', 'leather', 'explorer'].some(keyword => itemName.includes(keyword))) {
      categorizedMenu['Footwear'].push(item);
      assigned = true;
    } else if (['calamari', 'cheese board', 'crispy rice', 'spicy tuna', 'artisan bread'].some(keyword => itemName.includes(keyword))) {
      categorizedMenu['Appetizers'].push(item);
      assigned = true;
    } else if (['lemonade', 'latte', 'cold brew', 'matcha latte', 'iced coffee', 'sparkling water', 'berry smoothie'].some(keyword => itemName.includes(keyword))) {
      categorizedMenu['Beverages'].push(item);
      assigned = true;
    }

    // If not assigned, put in a default category or create one
    if (!assigned) {
      if (!categorizedMenu['Other']) {
        categorizedMenu['Other'] = [];
      }
      categorizedMenu['Other'].push(item);
    }
  });

  return categorizedMenu;
};

export const MenuProvider = ({ children }: { children: ReactNode }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [categorizedMenu, setCategorizedMenu] = useState<CategorizedMenu>({});
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeData = async () => {
      const { menuItems: loadedMenuItems, categories: loadedCategories, categorizedMenu: loadedCategorizedMenu } = await loadData();
      setMenuItems(loadedMenuItems);
      setCategories(loadedCategories);

      // Always use the categorized menu from the API - it should be consistent now
      if (loadedCategorizedMenu && Object.keys(loadedCategorizedMenu).length > 0) {
        console.log('MenuContext - Using API categorized menu:', loadedCategorizedMenu);
        setCategorizedMenu(loadedCategorizedMenu);
      } else {
        // Fallback to building categorized menu only if API doesn't provide one
        const fallbackMenu = buildCategorizedMenu(loadedMenuItems, loadedCategories);
        console.log('MenuContext - Using fallback categorized menu:', fallbackMenu);
        setCategorizedMenu(fallbackMenu);
      }

      setIsInitialized(true);
    };
    initializeData();
  }, []);

  // Remove localStorage operations for static export

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

  const addProduct = async (newProduct: Omit<MenuItem, 'id'>, category: string) => {
    const fullNewProduct: MenuItem = {
      ...newProduct,
      id: `new-${Date.now()}`,
    };

    // Store previous state for rollback
    const prevItems = menuItems;
    const prevCategories = categories;
    const prevMenu = categorizedMenu;

    // Optimistic update
    const newItems = [...menuItems, fullNewProduct];
    const newMenu = { ...categorizedMenu };
    if (!newMenu[category]) {
      newMenu[category] = [];
    }
    newMenu[category].push(fullNewProduct);

    // Add category if it doesn't exist
    const newCategories = categories.includes(category) ? categories : [...categories, category];

    console.log('MenuContext - Adding product:', fullNewProduct.name, 'to category:', category);

    setMenuItems(newItems);
    setCategories(newCategories);
    setCategorizedMenu(newMenu);
    setIsSaving(true);

    try {
      await saveData(newItems, newCategories, newMenu);
      console.log('MenuContext - Product added successfully');
    } catch (error) {
      // Rollback on failure
      console.error('MenuContext - Failed to add product, rolling back');
      setMenuItems(prevItems);
      setCategories(prevCategories);
      setCategorizedMenu(prevMenu);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const updateProduct = async (updatedProduct: MenuItem, newCategory?: string) => {
    const newItems = menuItems.map((item) =>
      item.id === updatedProduct.id ? updatedProduct : item
    );
    let newMenu = { ...categorizedMenu };
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
          break;
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

    setMenuItems(newItems);
    setCategorizedMenu(newMenu);
    await saveData(newItems, categories, newMenu);
  };

  const deleteProduct = async (productId: string) => {
    // Store previous state for rollback
    const prevItems = menuItems;
    const prevMenu = categorizedMenu;

    // Optimistic update
    const newItems = menuItems.filter((item) => item.id !== productId);
    const newMenu = { ...categorizedMenu };
    for (const category in newMenu) {
      newMenu[category] = newMenu[category].filter(
        (item) => item.id !== productId
      );
      if (newMenu[category].length === 0) {
        delete newMenu[category];
      }
    }

    setMenuItems(newItems);
    setCategorizedMenu(newMenu);
    setIsSaving(true);

    try {
      await saveData(newItems, categories, newMenu);
    } catch (error) {
      // Rollback on failure
      setMenuItems(prevItems);
      setCategorizedMenu(prevMenu);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const addCategory = async (categoryName: string) => {
    if (!categories.includes(categoryName)) {
      // Store previous state for rollback
      const prevCategories = categories;
      const prevMenu = categorizedMenu;

      // Optimistic update
      const newCategories = [...categories, categoryName];
      const newMenu = {
        ...categorizedMenu,
        [categoryName]: [],
      };

      setCategories(newCategories);
      setCategorizedMenu(newMenu);
      setIsSaving(true);

      try {
        await saveData(menuItems, newCategories, newMenu);
      } catch (error) {
        // Rollback on failure
        setCategories(prevCategories);
        setCategorizedMenu(prevMenu);
        throw error;
      } finally {
        setIsSaving(false);
      }
    }
  };

  const updateCategory = async (oldName: string, newName: string) => {
    if (oldName === newName) return;
    const newCategories = categories.map((cat) => (cat === oldName ? newName : cat));
    const newMenu = { ...categorizedMenu };
    if (newMenu[oldName]) {
      newMenu[newName] = newMenu[oldName];
      delete newMenu[oldName];
    }

    setCategories(newCategories);
    setCategorizedMenu(newMenu);
    await saveData(menuItems, newCategories, newMenu);
  };

  const deleteCategory = async (categoryName: string) => {
    // Store previous state for rollback
    const prevItems = menuItems;
    const prevCategories = categories;
    const prevMenu = categorizedMenu;

    // Optimistic update
    const itemsInCategory = categorizedMenu[categoryName] || [];
    const itemIdsInCategory = itemsInCategory.map((item) => item.id);
    const newItems = menuItems.filter((item) => !itemIdsInCategory.includes(item.id));
    const newCategories = categories.filter((cat) => cat !== categoryName);
    const newMenu = { ...categorizedMenu };
    delete newMenu[categoryName];

    setMenuItems(newItems);
    setCategories(newCategories);
    setCategorizedMenu(newMenu);
    setIsSaving(true);

    try {
      await saveData(newItems, newCategories, newMenu);
    } catch (error) {
      // Rollback on failure
      setMenuItems(prevItems);
      setCategories(prevCategories);
      setCategorizedMenu(prevMenu);
      throw error;
    } finally {
      setIsSaving(false);
    }
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
        isSaving,
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
