export const px = (id, w = 800) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

export const CANTEENS = [
  {
    canteen_id: 'sopanam',
    name: 'Sopanam Canteen',
    description: 'South Indian breakfast & snacks specialist',
    operating_hours: '7:00 AM - 10:00 PM',
    image_url: px(5560763),
  },
  {
    canteen_id: 'mba',
    name: 'MBA Canteen',
    description: 'North Indian meals & premium dining',
    operating_hours: '8:00 AM - 9:00 PM',
    image_url: px(7625056),
  },
  {
    canteen_id: 'samudra',
    name: 'Samudra Canteen',
    description: 'Traditional meals & health options',
    operating_hours: '7:30 AM - 9:30 PM',
    image_url: px(5410418),
  },
];

const item = (item_id, canteen_id, name, price, [calories, carbs, protein, fat, fiber, sodium], vitamins, ingredients, allergens, category, veg_type, prep_time, imageId, stock_qty = 80) => ({
  item_id,
  canteen_id,
  name,
  price,
  nutrition: { calories, carbs, protein, fat, fiber, vitamins, sodium },
  ingredients,
  allergens,
  stock_qty,
  category,
  image_url: imageId ? px(imageId, 600) : '',
  veg_type,
  prep_time,
  available: true,
  created_at: '2025-01-01T00:00:00.000Z',
});

export const MENU_ITEMS = [
  item('item_sopanam_001', 'sopanam', 'Idli (2 pcs)', 20, [58, 12, 2, 0.5, 1, 10], 'B1, B2, B3', 'Fermented rice and urad dal batter, steamed', 'None', 'Breakfast', 'veg', 5, 4331489, 100),
  item('item_sopanam_002', 'sopanam', 'Masala Dosa', 45, [220, 38, 6, 5, 3, 280], 'B6, C, E', 'Rice-lentil crepe with spiced potato filling', 'None', 'Breakfast', 'veg', 10, 5560763),
  item('item_sopanam_003', 'sopanam', 'Samosa (2 pcs)', 25, [260, 30, 5, 13, 3, 320], 'B9, K', 'Crisp pastry stuffed with spiced potato and peas', 'Gluten, Deep fried', 'Snacks', 'veg', 8, 4449068, 90),
  item('item_sopanam_004', 'sopanam', 'Pongal', 35, [280, 42, 8, 9, 3.5, 320], 'B1, B3, E', 'Rice and moong dal cooked with ghee, pepper, cumin', 'Dairy', 'Breakfast', 'veg', 12, 9609838, 60),
  item('item_sopanam_005', 'sopanam', 'Filter Coffee', 15, [45, 6, 2, 2, 0, 25], 'B2', 'Decoction coffee with hot milk and sugar', 'Dairy', 'Beverages', 'veg', 3, 312418, 150),
  item('item_sopanam_006', 'sopanam', 'Upma', 30, [250, 45, 6, 6, 4, 280], 'B complex', 'Semolina with vegetables, mustard seeds, curry leaves', 'Gluten', 'Breakfast', 'veg', 10, 6937455, 70),
  item('item_sopanam_007', 'sopanam', 'Poori Bhaji (3 pcs)', 40, [320, 48, 8, 12, 4.5, 350], 'A, C, K', 'Deep fried wheat bread with spiced potato curry', 'Gluten, Deep fried', 'Breakfast', 'veg', 12, 11818239, 65),

  item('item_mba_001', 'mba', 'Chicken Biryani', 120, [650, 78, 35, 22, 3, 890], 'B6, B12, D', 'Basmati rice with marinated chicken, spices, herbs', 'Dairy', 'Main Course', 'non-veg', 25, 12737656, 50),
  item('item_mba_002', 'mba', 'Chicken Dum Biryani (Family)', 220, [1100, 130, 60, 38, 5, 1500], 'B6, B12, D', 'Slow-cooked dum biryani with fried chicken, serves two', 'Dairy', 'Main Course', 'non-veg', 30, 6260921, 30),
  item('item_mba_003', 'mba', 'Butter Naan with Curry', 70, [420, 55, 12, 16, 3, 620], 'B1, B3', 'Leavened flatbread brushed with butter, served with curry', 'Gluten, Dairy', 'Breads', 'veg', 8, 7625056, 100),
  item('item_mba_004', 'mba', 'Paneer Butter Masala', 110, [420, 18, 22, 32, 3, 680], 'A, D, B12', 'Cottage cheese in creamy tomato-butter gravy', 'Dairy', 'Main Course', 'veg', 15, 9609844, 45),
  item('item_mba_005', 'mba', 'Chilli Chicken', 150, [380, 12, 42, 18, 1, 820], 'B6, B12, D', 'Crispy chicken tossed with peppers, garlic and chilli', 'Soy', 'Starters', 'non-veg', 20, 7353380, 40),
  item('item_mba_006', 'mba', 'Dal Makhani', 80, [320, 35, 15, 14, 8, 560], 'B9, B1', 'Black lentils cooked with cream, butter, tomatoes', 'Dairy', 'Main Course', 'veg', 18, 2474661, 55),
  item('item_mba_007', 'mba', 'Mango Lassi', 50, [180, 32, 6, 4, 1, 85], 'A, C, D', 'Mango pulp blended with yogurt and sugar', 'Dairy', 'Beverages', 'veg', 5, null, 80),

  item('item_samudra_001', 'samudra', 'Full Meals (Unlimited)', 80, [800, 125, 22, 20, 12, 950], 'A, C, K, B complex', 'Rice, sambar, rasam, vegetables, curd, papad on banana leaf', 'Dairy', 'Meals', 'veg', 15, 5410418, 100),
  item('item_samudra_002', 'samudra', 'Sambar Rice', 50, [350, 62, 12, 8, 8, 620], 'A, C, K', 'Rice with lentil-vegetable stew, tamarind, spices', 'None', 'Meals', 'veg', 10, 674574, 75),
  item('item_samudra_003', 'samudra', 'Curd Rice', 40, [280, 48, 8, 6, 1.5, 320], 'B12, D, Calcium', 'Cooked rice mixed with yogurt, tempered with spices', 'Dairy', 'Light Meals', 'veg', 8, null, 90),
  item('item_samudra_004', 'samudra', 'Veg Curry Bowl', 60, [310, 30, 9, 15, 7, 480], 'A, C', 'Seasonal vegetables simmered in a mild coconut curry', 'None', 'Meals', 'veg', 12, 5410400, 85),
  item('item_samudra_005', 'samudra', 'Buttermilk', 15, [40, 5, 3, 1, 0, 180], 'B12, Probiotics', 'Churned yogurt with water, salt, spices', 'Dairy', 'Beverages', 'veg', 3, null, 120),
  item('item_samudra_006', 'samudra', 'Garden Salad Bowl', 55, [160, 18, 6, 7, 6, 210], 'A, C, K', 'Greens, cucumber, tomato and sprouts with lemon dressing', 'None', 'Healthy Options', 'veg', 6, 1640777, 60),
  item('item_samudra_007', 'samudra', 'Fruit Salad', 45, [120, 30, 2, 0.5, 5, 5], 'A, C, E, K', 'Fresh seasonal fruits - apple, banana, grapes, papaya', 'None', 'Healthy Options', 'veg', 7, 1092730, 70),
];
