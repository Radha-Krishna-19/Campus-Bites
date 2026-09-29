import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Utensils, ShoppingCart, ArrowLeft, Search, Plus, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import api from '@/utils/api';
import { getAuth } from '@/utils/auth';
import { addToCart, getCartItemCount } from '@/utils/cart';
import { toast } from 'sonner';
import SkeletonLoader from '@/components/SkeletonLoader';
import EmptyState from '@/components/EmptyState';
import FoodImage from '@/components/FoodImage';

export default function CanteenView() {
  const { canteenId } = useParams();
  const navigate = useNavigate();
  const { user } = getAuth();
  const [canteen, setCanteen] = useState(null);
  const [allCanteens, setAllCanteens] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [selectedAllergyFilter, setSelectedAllergyFilter] = useState('all');
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate('/student/login', { state: { from: `/student/canteen/${canteenId}` } });
      return;
    }
    setSelectedCategory('All');
    setSearchQuery('');
    fetchData();
    setCartCount(getCartItemCount());
  }, [canteenId, user, navigate]);

  useEffect(() => {
    filterItems();
  }, [searchQuery, selectedCategory, sortBy, selectedAllergyFilter, menuItems]);

  const fetchData = async () => {
    try {
      const [canteenRes, menuRes] = await Promise.all([
        api.get('/canteens'),
        api.get(`/menu/${canteenId}`)
      ]);
      
      const currentCanteen = canteenRes.data.find(c => c.canteen_id === canteenId);
      setCanteen(currentCanteen);
      setAllCanteens(canteenRes.data);
      setMenuItems(menuRes.data.filter(item => item.available));
      setFilteredItems(menuRes.data.filter(item => item.available));
    } catch (error) {
      toast.error('Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = menuItems;

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.ingredients.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Allergy filters
    if (selectedAllergyFilter !== 'all') {
      filtered = filtered.filter(item => {
        const allergens = item.allergens.toLowerCase();
        switch (selectedAllergyFilter) {
          case 'dairy-free':
            return !allergens.includes('dairy');
          case 'gluten-free':
            return !allergens.includes('gluten');
          case 'nut-free':
            return !allergens.includes('nut');
          case 'veg-only':
            return item.veg_type === 'veg';
          default:
            return true;
        }
      });
    }

    // Sort items
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'calories-low':
          return a.nutrition.calories - b.nutrition.calories;
        case 'calories-high':
          return b.nutrition.calories - a.nutrition.calories;
        case 'protein-high':
          return b.nutrition.protein - a.nutrition.protein;
        case 'carbs-low':
          return a.nutrition.carbs - b.nutrition.carbs;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredItems(filtered);
  };

  const categories = ['All', ...new Set(menuItems.map(item => item.category))];

  const handleAddToCart = (item) => {
    addToCart(item, 1);
    setCartCount(getCartItemCount());
    toast.success(`${item.name} added to cart!`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-orange-50">
        <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-orange-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
              <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse" />
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mb-8" />
          <SkeletonLoader type="menu" count={6} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-orange-50">
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/student/dashboard')} data-testid="back-btn">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center gap-2">
                <Utensils className="w-6 h-6 text-orange-600" />
                <span className="text-xl font-bold gradient-text">{canteen?.name}</span>
              </div>
            </div>
            <Link to="/student/cart" className="relative" data-testid="cart-link">
              <Button variant="outline" size="sm" className="rounded-full">
                <ShoppingCart className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="relative mb-8 overflow-hidden rounded-3xl shadow-xl">
          <FoodImage src={canteen?.image_url} alt={canteen?.name} className="h-44 sm:h-56" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-1">{canteen?.name}</h1>
            <p className="text-orange-100">{canteen?.description}</p>
            <p className="mt-2 inline-flex items-center gap-2 text-sm text-white/80">
              <Clock className="w-4 h-4" /> {canteen?.operating_hours}
            </p>
          </div>
        </div>

        <div className="mb-8 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Switch canteen">
          {allCanteens.map((c) => (
            <Link
              key={c.canteen_id}
              to={`/student/canteen/${c.canteen_id}`}
              role="tab"
              aria-selected={c.canteen_id === canteenId}
              className={`relative whitespace-nowrap rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
                c.canteen_id === canteenId ? 'text-white' : 'bg-white text-gray-600 border border-orange-100 hover:text-orange-600'
              }`}
              data-testid={`switch-canteen-${c.canteen_id}`}
            >
              {c.canteen_id === canteenId && (
                <motion.span layoutId="canteen-pill" className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg shadow-orange-500/30" />
              )}
              <span className="relative">{c.name}</span>
            </Link>
          ))}
        </div>

        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search by name or ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-xl border-gray-200"
              data-testid="search-input"
            />
          </div>

          <div className="space-y-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="rounded-full whitespace-nowrap"
                  data-testid={`category-${category}`}
                >
                  {category}
                </Button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-2 flex-1">
                <span className="text-sm text-gray-600 whitespace-nowrap">Dietary:</span>
                <select
                  value={selectedAllergyFilter}
                  onChange={(e) => setSelectedAllergyFilter(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                  data-testid="allergy-filter"
                >
                  <option value="all">All Items</option>
                  <option value="veg-only">Vegetarian Only</option>
                  <option value="dairy-free">Dairy Free</option>
                  <option value="gluten-free">Gluten Free</option>
                  <option value="nut-free">Nut Free</option>
                </select>
              </div>

              <div className="flex items-center gap-2 flex-1">
                <span className="text-sm text-gray-600 whitespace-nowrap">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                  data-testid="sort-select"
                >
                  <option value="name">Name (A-Z)</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="calories-low">Calories: Low to High</option>
                  <option value="calories-high">Calories: High to Low</option>
                  <option value="protein-high">Protein: High to Low</option>
                  <option value="carbs-low">Carbs: Low to High</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <motion.div
              key={item.item_id}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -6 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              className="group bg-white rounded-3xl overflow-hidden shadow-lg border border-orange-100 hover:shadow-2xl hover:shadow-orange-500/10 transition-shadow duration-300"
              data-testid={`menu-item-${item.item_id}`}
            >
              <div className="relative h-48">
                <FoodImage
                  src={item.image_url}
                  alt={item.name}
                  className="h-full"
                  imgClassName="transition-transform duration-500 group-hover:scale-110"
                  iconClassName="w-20 h-20"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="rounded-full bg-white/90 backdrop-blur px-2.5 py-1 text-xs font-semibold text-gray-700 shadow">
                    {item.prep_time} min
                  </span>
                  {item.stock_qty <= 10 && (
                    <span className="rounded-full bg-red-500/90 px-2.5 py-1 text-xs font-semibold text-white shadow">
                      Only {item.stock_qty} left
                    </span>
                  )}
                </div>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{item.name}</h3>
                    <Badge variant={item.veg_type === 'veg' ? 'secondary' : 'destructive'} className="text-xs">
                      {item.veg_type === 'veg' ? 'Veg' : 'Non-Veg'}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-orange-600">₹{item.price}</p>
                    <p className="text-xs text-gray-500">{item.nutrition.calories} kcal</p>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{item.ingredients}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-xs px-2 py-1 bg-orange-50 text-orange-700 rounded-full">
                    P: {item.nutrition.protein}g
                  </span>
                  <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full">
                    C: {item.nutrition.carbs}g
                  </span>
                  <span className="text-xs px-2 py-1 bg-amber-50 text-amber-700 rounded-full">
                    F: {item.nutrition.fat}g
                  </span>
                  <span className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded-full">
                    Fiber: {item.nutrition.fiber}g
                  </span>
                </div>

                <Button
                  onClick={() => handleAddToCart(item)}
                  className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                  data-testid={`add-to-cart-${item.item_id}`}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <EmptyState
            type="search"
            onAction={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setSelectedAllergyFilter('all');
            }}
            actionText="Clear Filters"
            actionTestId="clear-filters-btn"
          />
        )}
      </main>
    </div>
  );
}
