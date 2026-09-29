// In-browser stand-in for the FastAPI backend, used when no REACT_APP_BACKEND_URL
// is configured (e.g. the GitHub Pages build). State lives in localStorage.
import { CANTEENS, MENU_ITEMS } from './demoData';

const DB_KEY = 'cb_demo_db_v3';
const KITCHEN_SECONDS = 40;

export const DEMO_STUDENT = { roll_number: 'CB.SC.U4CSE23001', password: 'demo123' };
export const DEMO_MANAGER = { email: 'canteenmanager@amrita.edu', password: 'admin123' };

export const CREW_PASSWORD = 'crew123';

const STAFF = [
  { user_id: 'mgmt_superadmin', email: 'canteenmanager@amrita.edu', password: 'admin123', name: 'Super Admin', role: 'management', canteen_id: null },
  { user_id: 'mgmt_sopanam', email: 'sopanam-admin@amrita.edu', password: 'sopanam123', name: 'Sopanam Manager', role: 'management', canteen_id: 'sopanam' },
  { user_id: 'mgmt_mba', email: 'mba-admin@amrita.edu', password: 'mba123', name: 'MBA Manager', role: 'management', canteen_id: 'mba' },
  { user_id: 'mgmt_samudra', email: 'samudra-admin@amrita.edu', password: 'samudra123', name: 'Samudra Manager', role: 'management', canteen_id: 'samudra' },
  ...CANTEENS.map((c) => ({ user_id: `crew_${c.canteen_id}`, email: `crew.${c.canteen_id}@amrita.edu`, password: CREW_PASSWORD, name: `${c.name} Crew`, role: 'crew', canteen_id: c.canteen_id })),
];

class HttpError extends Error {
  constructor(status, detail) {
    super(detail);
    this.status = status;
  }
}

const uid = (prefix) => `${prefix}_${Math.random().toString(36).slice(2, 14)}`;
const tokenNumber = () => String(Math.floor(100000 + Math.random() * 900000));

async function hash(text) {
  const bytes = new TextEncoder().encode(`campus-bites:${text}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Historical completed orders so analytics and history aren't empty on first visit.
function sampleOrders(studentId) {
  const orders = [];
  const now = Date.now();
  let seed = 7;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  for (let i = 0; i < 36; i++) {
    const canteen = CANTEENS[i % 3].canteen_id;
    const pool = MENU_ITEMS.filter((m) => m.canteen_id === canteen);
    const picks = [pool[Math.floor(rand() * pool.length)], pool[Math.floor(rand() * pool.length)]];
    const items = [];
    picks.forEach((m) => {
      const existing = items.find((it) => it.item_id === m.item_id);
      if (existing) existing.quantity += 1;
      else items.push({ item_id: m.item_id, item_name: m.name, quantity: 1, price_at_order: m.price });
    });
    const created = new Date(now - (i * 9 + 2) * 3600 * 1000).toISOString();
    orders.push({
      order_id: `order_sample_${i}`,
      student_id: i % 4 === 0 ? studentId : 'user_sample_crowd',
      items,
      canteen_id: canteen,
      token_number: tokenNumber(),
      status: 'COMPLETED',
      total_amount: items.reduce((s, it) => s + it.price_at_order * it.quantity, 0),
      created_at: created,
      updated_at: created,
      paid_at: created,
    });
  }
  return orders;
}

async function seed() {
  const student = {
    user_id: 'user_demo_student',
    roll_number: DEMO_STUDENT.roll_number,
    name: 'Demo Student',
    email: 'demo.student@amrita.edu',
    role: 'student',
    password_hash: await hash(DEMO_STUDENT.password),
    created_at: new Date().toISOString(),
  };
  const staff = await Promise.all(STAFF.map(async ({ password, ...m }) => ({ ...m, password_hash: await hash(password) })));
  const orders = sampleOrders(student.user_id);
  const bills = orders
    .filter((o) => o.student_id === student.user_id)
    .map((o) => ({ bill_id: `bill_${o.order_id}`, student_id: o.student_id, order_id: o.order_id, amount: o.total_amount, items: o.items, timestamp: o.paid_at }));
  return {
    canteens: CANTEENS,
    menu_items: MENU_ITEMS,
    users: [student, ...staff],
    orders,
    bills,
  };
}

function read() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function write(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

let ready = null;
async function load() {
  if (!ready) {
    ready = (async () => {
      if (!read()) write(await seed());
    })();
  }
  await ready;
  return read();
}

// Orders being cooked become READY once the kitchen time has elapsed.
function advanceKitchen(db) {
  let changed = false;
  const now = Date.now();
  db.orders.forEach((o) => {
    if (o.status === 'PREPARING' && o.paid_at && now - new Date(o.paid_at).getTime() > KITCHEN_SECONDS * 1000) {
      o.status = 'READY';
      o.updated_at = new Date().toISOString();
      changed = true;
    }
  });
  return changed;
}

export async function orderStatusSnapshot() {
  const db = await load();
  if (advanceKitchen(db)) write(db);
  return db.orders.map(({ order_id, status, student_id, canteen_id }) => ({ order_id, status, student_id, canteen_id }));
}

function currentUser(db, headers) {
  const auth = headers?.Authorization || headers?.authorization || '';
  const token = auth.replace('Bearer ', '');
  const user = token.startsWith('demo.') && db.users.find((u) => u.user_id === token.slice(5));
  if (!user) throw new HttpError(401, 'Not authenticated');
  return user;
}

const publicUser = ({ password_hash, ...u }) => u;
const session = (user) => ({ user: publicUser(user), token: `demo.${user.user_id}` });
const isPaid = (o) => o.status !== 'PENDING_PAYMENT';

function spending(db, userId) {
  const bills = db.bills.filter((b) => b.student_id === userId);
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfWeek = startOfDay - ((now.getDay() + 6) % 7) * 86400000;
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const sumSince = (t) => bills.filter((b) => new Date(b.timestamp).getTime() >= t).reduce((s, b) => s + b.amount, 0);
  return {
    student_id: userId,
    daily_total: sumSince(startOfDay),
    weekly_total: sumSince(startOfWeek),
    monthly_total: sumSince(startOfMonth),
    last_updated: now.toISOString(),
  };
}

const SYMPTOMS = [
  { keys: ['stress', 'anxious', 'anxiety', 'exam', 'tense'], explanation: 'When you are stressed, warm, easy-to-digest food and complex carbs help steady your mood and energy. Go easy on caffeine and deep-fried snacks.', prefer: ['Pongal', 'Curd Rice', 'Fruit Salad', 'Idli (2 pcs)'], avoid: ['Filter Coffee', 'Samosa (2 pcs)', 'Chilli Chicken'] },
  { keys: ['headache', 'migraine'], explanation: 'Headaches are often linked to dehydration and skipped meals. Hydrating, light food with a little salt tends to help.', prefer: ['Buttermilk', 'Sambar Rice', 'Garden Salad Bowl', 'Idli (2 pcs)'], avoid: ['Samosa (2 pcs)', 'Chilli Chicken'] },
  { keys: ['tired', 'fatigue', 'sleepy', 'low energy', 'weak'], explanation: 'For low energy, pair steady carbohydrates with protein so the energy lasts through your next class.', prefer: ['Masala Dosa', 'Dal Makhani', 'Chicken Biryani', 'Fruit Salad'], avoid: ['Poori Bhaji (3 pcs)'] },
  { keys: ['cold', 'cough', 'throat', 'flu'], explanation: 'Warm, peppery and soupy dishes are soothing for a cold. Skip chilled drinks until you feel better.', prefer: ['Pongal', 'Sambar Rice', 'Filter Coffee', 'Veg Curry Bowl'], avoid: ['Mango Lassi', 'Buttermilk', 'Curd Rice'] },
  { keys: ['fever'], explanation: 'With a fever, keep meals light, soft and hydrating so your body can focus on recovering.', prefer: ['Idli (2 pcs)', 'Curd Rice', 'Buttermilk', 'Fruit Salad'], avoid: ['Chilli Chicken', 'Samosa (2 pcs)', 'Poori Bhaji (3 pcs)'] },
  { keys: ['stomach', 'acidity', 'gas', 'bloat', 'indigestion'], explanation: 'For an upset stomach, cooling probiotic foods and plain rice are gentle. Avoid oily and spicy dishes today.', prefer: ['Curd Rice', 'Buttermilk', 'Idli (2 pcs)'], avoid: ['Chilli Chicken', 'Samosa (2 pcs)', 'Paneer Butter Masala'] },
  { keys: ['gym', 'workout', 'protein', 'muscle'], explanation: 'After a workout, prioritise protein with some carbs to refuel and help your muscles recover.', prefer: ['Chicken Biryani', 'Chilli Chicken', 'Paneer Butter Masala', 'Dal Makhani'], avoid: [] },
];

function symptomAdvice(db, text) {
  const t = (text || '').toLowerCase();
  const match = SYMPTOMS.find((s) => s.keys.some((k) => t.includes(k)));
  const menu = db.menu_items.filter((m) => m.available);
  const byName = (n) => menu.find((m) => m.name === n);
  const canteenName = (id) => db.canteens.find((c) => c.canteen_id === id)?.name;
  if (!match) {
    const light = [...menu].sort((a, b) => b.nutrition.fiber - a.nutrition.fiber).slice(0, 3);
    return {
      explanation: "I couldn't pin that down to a specific condition, so here are balanced, high-fibre picks that suit most days. Try words like stressed, tired, headache, cold or fever for targeted suggestions.",
      recommended_items: light.map((m) => ({ item_id: m.item_id, item_name: m.name, reason: `${m.nutrition.fiber}g fibre, ${m.nutrition.calories} kcal · ${canteenName(m.canteen_id)}` })),
      avoid: [],
    };
  }
  return {
    explanation: match.explanation,
    recommended_items: match.prefer.map(byName).filter(Boolean).map((m) => ({
      item_id: m.item_id,
      item_name: m.name,
      reason: `${m.ingredients} · ${m.nutrition.calories} kcal · ${canteenName(m.canteen_id)}`,
    })),
    avoid: match.avoid,
  };
}

function dietPlan(db, { protein_goal = 120, carbs_goal = 250, calories_goal = 2200 }) {
  const menu = db.menu_items.filter((m) => m.available);
  const pick = (filter, sort, offset) => {
    const pool = menu.filter(filter).sort(sort);
    return pool[offset % pool.length];
  };
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const highProtein = (a, b) => b.nutrition.protein - a.nutrition.protein;
  const portion = (m) => `${m.nutrition.calories} kcal · ${m.nutrition.protein}g protein`;
  const weekly_plan = {};
  days.forEach((day, i) => {
    const breakfast = pick((m) => ['Breakfast'].includes(m.category), highProtein, i);
    const lunch = pick((m) => ['Main Course', 'Meals'].includes(m.category), highProtein, i);
    const snack = pick((m) => ['Healthy Options', 'Snacks', 'Starters'].includes(m.category), highProtein, i);
    const dinner = pick((m) => ['Main Course', 'Meals', 'Light Meals'].includes(m.category), highProtein, i + 2);
    weekly_plan[day] = Object.fromEntries(
      Object.entries({ breakfast, lunch, snack, dinner }).map(([k, m]) => [k, { item_name: m.name, portion: portion(m) }])
    );
  });
  const proteinPerMeal = Math.round(protein_goal / 4);
  return {
    daily_calories: calories_goal,
    protein_target: protein_goal,
    carbs_target: carbs_goal,
    tips: [
      `Aim for roughly ${proteinPerMeal}g of protein per meal to reach ${protein_goal}g a day.`,
      'Pick high-protein mains from MBA Canteen on training days and lighter meals from Samudra on rest days.',
      `Keep carbs close to ${carbs_goal}g — idli, dosa and rice dishes are clean, easily digested sources.`,
      'Drink buttermilk or water with meals instead of sugary drinks to stay hydrated.',
    ],
    weekly_plan,
  };
}

function topItems(orders) {
  const sales = {};
  orders.forEach((o) =>
    o.items.forEach((it) => {
      sales[it.item_id] = sales[it.item_id] || { item_id: it.item_id, item_name: it.item_name, quantity: 0, revenue: 0 };
      sales[it.item_id].quantity += it.quantity;
      sales[it.item_id].revenue += it.quantity * it.price_at_order;
    })
  );
  return Object.values(sales).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
}

async function route(method, path, body, headers) {
  const db = await load();
  const save = () => write(db);
  const me = () => currentUser(db, headers);
  let m;

  if (method === 'post' && path === '/auth/student/register') {
    const roll = (body.roll_number || '').trim().toUpperCase();
    if (db.users.some((u) => u.roll_number === roll)) throw new HttpError(400, 'Roll number already registered');
    const user = {
      user_id: uid('user'),
      roll_number: roll,
      name: body.name,
      email: body.email || null,
      role: 'student',
      password_hash: await hash(body.password),
      created_at: new Date().toISOString(),
    };
    db.users.push(user);
    save();
    return session(user);
  }

  if (method === 'post' && path === '/auth/student/login') {
    const roll = (body.roll_number || '').trim().toUpperCase();
    const user = db.users.find((u) => u.role === 'student' && u.roll_number === roll);
    if (!user || user.password_hash !== (await hash(body.password))) throw new HttpError(401, 'Invalid roll number or password');
    return session(user);
  }

  if (method === 'post' && (m = path.match(/^\/auth\/(management|crew)\/login$/))) {
    const email = (body.email || '').trim().toLowerCase();
    const user = db.users.find((u) => u.role === m[1] && u.email === email);
    if (!user || user.password_hash !== (await hash(body.password))) throw new HttpError(401, 'Invalid email or password');
    return session(user);
  }

  if (method === 'get' && path === '/auth/me') return publicUser(me());
  if (method === 'post' && path === '/auth/logout') return { message: 'Logged out successfully' };

  if (method === 'get' && path === '/canteens') return db.canteens;

  if (method === 'get' && (m = path.match(/^\/menu\/item\/([^/]+)$/))) {
    const found = db.menu_items.find((i) => i.item_id === m[1]);
    if (!found) throw new HttpError(404, 'Item not found');
    return found;
  }

  if (method === 'get' && (m = path.match(/^\/menu\/([^/]+)$/))) return db.menu_items.filter((i) => i.canteen_id === m[1]);

  if (method === 'post' && path === '/menu') {
    if (me().role !== 'management') throw new HttpError(403, 'Unauthorized');
    const created = { ...body, item_id: uid('item'), available: true, created_at: new Date().toISOString() };
    db.menu_items.push(created);
    save();
    return created;
  }

  if (method === 'patch' && (m = path.match(/^\/menu\/([^/]+)$/))) {
    if (!['management', 'crew'].includes(me().role)) throw new HttpError(403, 'Unauthorized');
    const target = db.menu_items.find((i) => i.item_id === m[1]);
    if (!target) throw new HttpError(404, 'Item not found');
    Object.entries(body).forEach(([k, v]) => v !== null && v !== undefined && (target[k] = v));
    save();
    return { message: 'Item updated successfully' };
  }

  if (method === 'post' && path === '/orders') {
    const user = me();
    if (user.role !== 'student') throw new HttpError(403, 'Only students can place orders');
    if (!body.items?.length) throw new HttpError(400, 'Order has no items');
    const now = new Date().toISOString();
    const order = {
      order_id: uid('order'),
      student_id: user.user_id,
      items: body.items,
      canteen_id: body.canteen_id,
      token_number: tokenNumber(),
      status: 'PENDING_PAYMENT',
      razorpay_order_id: uid('order_test'),
      total_amount: body.total_amount,
      created_at: now,
      updated_at: now,
    };
    db.orders.push(order);
    save();
    return {
      order_id: order.order_id,
      token_number: order.token_number,
      razorpay_order_id: order.razorpay_order_id,
      razorpay_key_id: 'rzp_test_demo',
      amount: order.total_amount,
      test_mode: true,
    };
  }

  if (method === 'post' && (m = path.match(/^\/orders\/([^/]+)\/verify-payment$/))) {
    const user = me();
    const order = db.orders.find((o) => o.order_id === m[1] && o.student_id === user.user_id);
    if (!order) throw new HttpError(404, 'Order not found');
    const now = new Date().toISOString();
    order.status = 'PREPARING';
    order.razorpay_payment_id = body.payment_id;
    order.paid_at = now;
    order.updated_at = now;
    order.items.forEach((it) => {
      const menuItem = db.menu_items.find((i) => i.item_id === it.item_id);
      if (menuItem) menuItem.stock_qty = Math.max(0, menuItem.stock_qty - it.quantity);
    });
    db.bills.push({ bill_id: uid('bill'), student_id: user.user_id, order_id: order.order_id, amount: order.total_amount, items: order.items, timestamp: now });
    save();
    return { message: 'Payment verified', status: 'PREPARING' };
  }

  if (method === 'get' && path === '/orders/my') {
    const user = me();
    if (advanceKitchen(db)) save();
    return db.orders.filter((o) => o.student_id === user.user_id).sort((a, b) => b.created_at.localeCompare(a.created_at));
  }

  if (method === 'get' && (m = path.match(/^\/orders\/pending\/([^/]+)$/))) {
    if (!['crew', 'management'].includes(me().role)) throw new HttpError(403, 'Unauthorized');
    if (advanceKitchen(db)) save();
    return db.orders
      .filter((o) => o.canteen_id === m[1] && ['PREPARING', 'READY'].includes(o.status))
      .sort((a, b) => a.created_at.localeCompare(b.created_at));
  }

  if (method === 'patch' && (m = path.match(/^\/orders\/([^/]+)\/status$/))) {
    if (!['crew', 'management'].includes(me().role)) throw new HttpError(403, 'Unauthorized');
    const order = db.orders.find((o) => o.order_id === m[1]);
    if (!order) throw new HttpError(404, 'Order not found');
    order.status = body.status;
    order.updated_at = new Date().toISOString();
    save();
    return { message: 'Status updated' };
  }

  if (method === 'post' && path === '/ai/recommendations/symptom') return symptomAdvice(db, body.symptom);
  if (method === 'get' && path === '/ai/recommendations/collaborative') {
    me();
    return { recommendations: symptomAdvice(db, '').recommended_items };
  }
  if (method === 'post' && path === '/ai/diet-plan') {
    me();
    return dietPlan(db, body);
  }

  if (method === 'get' && path === '/spending/analytics') return spending(db, me().user_id);
  if (method === 'get' && path === '/spending/bills') {
    const user = me();
    return db.bills.filter((b) => b.student_id === user.user_id).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }

  if (method === 'get' && path.startsWith('/management/analytics/')) {
    const user = me();
    if (user.role !== 'management') throw new HttpError(403, 'Unauthorized');
    const orders = db.orders.filter((o) => isPaid(o) && (!user.canteen_id || o.canteen_id === user.canteen_id));
    if (path === '/management/analytics/revenue') {
      const total_revenue = orders.reduce((s, o) => s + o.total_amount, 0);
      const by_canteen = db.canteens.map((c) => {
        const cs = orders.filter((o) => o.canteen_id === c.canteen_id);
        return { canteen_id: c.canteen_id, name: c.name, orders: cs.length, revenue: cs.reduce((s, o) => s + o.total_amount, 0) };
      });
      return {
        total_revenue,
        total_orders: orders.length,
        average_order_value: orders.length ? total_revenue / orders.length : 0,
        by_canteen,
      };
    }
    if (path === '/management/analytics/top-items') return topItems(orders);
  }

  throw new HttpError(404, `No demo route for ${method.toUpperCase()} ${path}`);
}

export async function demoAdapter(config) {
  const method = (config.method || 'get').toLowerCase();
  const path = (config.url || '').split('?')[0];
  let body = config.data;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }
  await new Promise((r) => setTimeout(r, 180 + Math.random() * 220));
  try {
    const data = await route(method, path, body || {}, config.headers);
    return { data, status: 200, statusText: 'OK', headers: {}, config, request: {} };
  } catch (err) {
    const status = err instanceof HttpError ? err.status : 500;
    const error = new Error(err.message);
    error.isAxiosError = true;
    error.config = config;
    error.response = { status, data: { detail: err.message }, headers: {}, config };
    throw error;
  }
}
