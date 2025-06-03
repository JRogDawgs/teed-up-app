export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'food' | 'drink' | 'snack';
  imageUrl?: string;
  prepTime: number; // in minutes
}

export const menuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Turn Dog',
    description: 'All-beef hot dog with your choice of toppings',
    price: 6.99,
    category: 'food',
    prepTime: 5,
  },
  {
    id: '2',
    name: 'Club Sandwich',
    description: 'Triple-decker with turkey, bacon, lettuce, and tomato',
    price: 12.99,
    category: 'food',
    prepTime: 10,
  },
  {
    id: '3',
    name: 'Chicken Wrap',
    description: 'Grilled chicken with mixed greens and chipotle mayo',
    price: 10.99,
    category: 'food',
    prepTime: 8,
  },
  {
    id: '4',
    name: 'Nachos',
    description: 'Tortilla chips with cheese, jalapeños, and salsa',
    price: 8.99,
    category: 'snack',
    prepTime: 7,
  },
  {
    id: '5',
    name: 'Beer',
    description: 'Domestic or Import',
    price: 5.99,
    category: 'drink',
    prepTime: 1,
  },
  {
    id: '6',
    name: 'Soft Drink',
    description: 'Fountain drink of your choice',
    price: 2.99,
    category: 'drink',
    prepTime: 1,
  },
  {
    id: '7',
    name: 'Water',
    description: 'Bottled water',
    price: 1.99,
    category: 'drink',
    prepTime: 1,
  },
  {
    id: '8',
    name: 'Mixed Nuts',
    description: 'Assorted nuts and dried fruits',
    price: 4.99,
    category: 'snack',
    prepTime: 2,
  },
];

export const getMenuItemsByCategory = (category: MenuItem['category']) => {
  return menuItems.filter(item => item.category === category);
};

export const getMenuItemById = (id: string) => {
  return menuItems.find(item => item.id === id);
}; 