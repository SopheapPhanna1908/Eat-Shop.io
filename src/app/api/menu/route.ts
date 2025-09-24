import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import type { MenuItem } from '@/lib/types';
import { menuItems as initialMenuItems } from '@/lib/data';
import { categorizeMenuItems } from '@/ai/flows/categorize-menu-items';

const DATA_FILE = path.join(process.cwd(), 'data', 'menu-data.json');
const BACKUP_FILE = path.join(process.cwd(), 'data', 'menu-data.json.backup');

interface MenuData {
  menuItems: MenuItem[];
  categories: string[];
  categorizedMenu: Record<string, MenuItem[]>;
}

// Ensure data directory exists
const ensureDataDir = () => {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Validate incoming data
const validateMenuData = (data: any): data is MenuData => {
  if (!data || typeof data !== 'object') return false;
  if (!Array.isArray(data.menuItems)) return false;
  if (!Array.isArray(data.categories)) return false;
  if (typeof data.categorizedMenu !== 'object') return false;

  // Validate menu items
  for (const item of data.menuItems) {
    if (!item.id || !item.name || typeof item.price !== 'number' || !item.image) {
      return false;
    }
  }

  return true;
};

// Load data from file with backup
const loadDataFromFile = (): MenuData => {
  ensureDataDir();
  if (fs.existsSync(DATA_FILE)) {
    try {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      const parsedData = JSON.parse(data);
      // Filter out "All Items" from categories
      parsedData.categories = parsedData.categories.filter((cat: string) => cat !== 'All Items');
      return parsedData;
    } catch (error) {
      console.error('Error parsing menu data file:', error);
      // Try to restore from backup
      if (fs.existsSync(BACKUP_FILE)) {
        try {
          const backupData = fs.readFileSync(BACKUP_FILE, 'utf8');
          const parsedBackup = JSON.parse(backupData);
          console.log('Restored data from backup');
          return parsedBackup;
        } catch (backupError) {
          console.error('Error parsing backup file:', backupError);
        }
      }
    }
  }
  // Return default data if file doesn't exist or is corrupted
  return {
    menuItems: initialMenuItems,
    categories: ['Apparel', 'Footwear', 'Appetizers', 'Beverages', 'Desserts'],
    categorizedMenu: {},
  };
};

// Save data to file with atomic write and backup
const saveDataToFile = (data: MenuData) => {
  ensureDataDir();

  // Create backup if original exists
  if (fs.existsSync(DATA_FILE)) {
    fs.copyFileSync(DATA_FILE, BACKUP_FILE);
  }

  // Write new data atomically
  const tempFile = `${DATA_FILE}.tmp`;
  try {
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2));
    fs.renameSync(tempFile, DATA_FILE);
    console.log('Data saved successfully to', DATA_FILE);
  } catch (error) {
    console.error('Error saving data:', error);
    // Clean up temp file
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
    throw error;
  }
};

export async function GET() {
  try {
    const data = loadDataFromFile();

    // Use saved categorized data if it exists and is not empty
    let categorizedMenu = data.categorizedMenu;

    // Only recategorize if categorized data is missing or empty
    if (!categorizedMenu || Object.keys(categorizedMenu).length === 0) {
      console.log('No saved categorized data found, running categorization...');

      // Use AI to categorize the menu items with fallback
      try {
        const aiCategorizedMenu = await categorizeMenuItems(data.menuItems);
        // Convert AI results to full MenuItem objects
        categorizedMenu = {};
        for (const [category, items] of Object.entries(aiCategorizedMenu)) {
          categorizedMenu[category] = items.map(item => {
            const fullItem = data.menuItems.find(menuItem => menuItem.name === item.name);
            return fullItem || item as MenuItem; // Fallback if not found
          });
        }
        console.log('AI categorization successful');
      } catch (aiError) {
        console.error('AI categorization failed, using fallback:', aiError);
        // Fallback to basic categorization
        categorizedMenu = buildFallbackCategorizedMenu(data.menuItems, data.categories);
        console.log('Using fallback categorization');
      }

      // Save the newly categorized data
      const updatedData = { ...data, categorizedMenu };
      saveDataToFile(updatedData);
      console.log('Saved new categorized data to file');
    } else {
      console.log('Using saved categorized data');
    }

    const responseData = {
      ...data,
      categorizedMenu,
    };
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error in GET /api/menu:', error);
    // Return default data if everything fails
    const defaultData = {
      menuItems: initialMenuItems,
      categories: ['Apparel', 'Footwear', 'Appetizers', 'Beverages', 'Desserts'],
      categorizedMenu: buildFallbackCategorizedMenu(initialMenuItems, ['Apparel', 'Footwear', 'Appetizers', 'Beverages', 'Desserts']),
    };
    return NextResponse.json(defaultData);
  }
}

// Fallback categorization function
const buildFallbackCategorizedMenu = (menuItems: MenuItem[], categories: string[]) => {
  const categorizedMenu: Record<string, MenuItem[]> = {};

  // Create categories based on existing categories list
  categories.forEach(category => {
    categorizedMenu[category] = [];
  });

  // Assign items to categories based on keywords (improved logic)
  menuItems.forEach(item => {
    const itemName = item.name.toLowerCase();
    let assigned = false;

    // Apparel keywords (clothing)
    if (['t-shirt', 'jeans', 'shirt', 'denim', 'linen', 'button-up', 'crewneck', 'crew neck'].some(keyword => itemName.includes(keyword))) {
      if (categorizedMenu['Apparel']) {
        categorizedMenu['Apparel'].push(item);
      } else {
        if (!categorizedMenu['Apparel']) categorizedMenu['Apparel'] = [];
        categorizedMenu['Apparel'].push(item);
      }
      assigned = true;
    }
    // Footwear keywords (shoes)
    else if (['sneakers', 'boots', 'loafers', 'ankle boots', 'leather', 'explorer'].some(keyword => itemName.includes(keyword))) {
      if (categorizedMenu['Footwear']) {
        categorizedMenu['Footwear'].push(item);
      } else {
        if (!categorizedMenu['Footwear']) categorizedMenu['Footwear'] = [];
        categorizedMenu['Footwear'].push(item);
      }
      assigned = true;
    }
    // Appetizers keywords (food starters)
    else if (['calamari', 'cheese board', 'crispy rice', 'spicy tuna', 'artisan bread', 'appetizer'].some(keyword => itemName.includes(keyword))) {
      if (categorizedMenu['Appetizers']) {
        categorizedMenu['Appetizers'].push(item);
      } else {
        if (!categorizedMenu['Appetizers']) categorizedMenu['Appetizers'] = [];
        categorizedMenu['Appetizers'].push(item);
      }
      assigned = true;
    }
    // Beverages keywords (drinks)
    else if (['lemonade', 'latte', 'cold brew', 'matcha latte', 'iced coffee', 'sparkling water', 'berry smoothie', 'coffee', 'tea', 'drink', 'beverage'].some(keyword => itemName.includes(keyword))) {
      if (categorizedMenu['Beverages']) {
        categorizedMenu['Beverages'].push(item);
      } else {
        if (!categorizedMenu['Beverages']) categorizedMenu['Beverages'] = [];
        categorizedMenu['Beverages'].push(item);
      }
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

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    if (!validateMenuData(data)) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
    }

    saveDataToFile(data);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in POST /api/menu:', error);
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
  }
}
