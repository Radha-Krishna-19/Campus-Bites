import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trash2, Plus, Minus, ArrowLeft, Loader2, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/utils/api';
import { getAuth } from '@/utils/auth';
import { getCart, updateCartItemQuantity, removeFromCart, clearCart, getCartTotal, getCartItemCount } from '@/utils/cart';
import { toast } from 'sonner';
import SuccessCelebration from '@/components/SuccessCelebration';
import EmptyState from '@/components/EmptyState';
import FoodImage from '@/components/FoodImage';

const CANTEEN_NAMES = { sopanam: 'Sopanam Canteen', mba: 'MBA Canteen', samudra: 'Samudra Canteen' };

export default function Cart() {
  const navigate = useNavigate();
  const { user } = getAuth();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [orderToken, setOrderToken] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/student/login');
      return;
    }
    setCart(getCart());
  }, [user, navigate]);

  const handleUpdateQuantity = (itemId, newQuantity) => {
    const updatedCart = updateCartItemQuantity(itemId, newQuantity);
    setCart(updatedCart);
  };

  const handleRemoveItem = (itemId) => {
    const updatedCart = removeFromCart(itemId);
    setCart(updatedCart);
    toast.success('Item removed from cart');
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const payForOrder = (order, amount) => new Promise((resolve, reject) => {
    const verify = (payment_id, signature) =>
      api.post(`/orders/${order.order_id}/verify-payment`, { payment_id, signature }).then(resolve, reject);

    if (order.test_mode) {
      verify('pay_test_' + Date.now(), 'test_signature');
      return;
    }

    loadRazorpayScript().then((loaded) => {
      if (!loaded) {
        reject(new Error('Failed to load payment gateway'));
        return;
      }
      const razorpay = new window.Razorpay({
        key: order.razorpay_key_id,
        amount: Math.round(amount * 100),
        currency: 'INR',
        name: 'Campus Bites',
        description: `Order #${order.token_number}`,
        order_id: order.razorpay_order_id,
        handler: (response) => verify(response.razorpay_payment_id, response.razorpay_signature),
        modal: { ondismiss: () => reject(new Error('Payment cancelled')) },
        prefill: { name: user.name, email: user.email || '', contact: '' },
        theme: { color: '#f97316' }
      });
      razorpay.open();
    });
  });

  // Each canteen prepares its own food, so a mixed cart becomes one order (and token) per canteen.
  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setLoading(true);
    const tokens = [];

    try {
      for (const group of groups) {
        const { data: order } = await api.post('/orders', {
          items: group.items.map(item => ({
            item_id: item.item_id,
            item_name: item.name,
            quantity: item.quantity,
            price_at_order: item.price
          })),
          canteen_id: group.canteenId,
          total_amount: group.total
        });
        await payForOrder(order, group.total);
        tokens.push(order.token_number);
        group.items.forEach(item => removeFromCart(item.item_id));
      }

      clearCart();
      setCart([]);
      setOrderToken(tokens.join(' · '));
      setShowSuccess(true);
    } catch (error) {
      setCart(getCart());
      toast.error(error.response?.data?.detail || error.message || 'Failed to place order');
      if (tokens.length) toast.success(`Order ${tokens.join(', ')} was placed successfully`);
    } finally {
      setLoading(false);
    }
  };

  const total = getCartTotal();
  const groups = Object.values(
    cart.reduce((acc, item) => {
      const g = (acc[item.canteen_id] = acc[item.canteen_id] || {
        canteenId: item.canteen_id,
        name: CANTEEN_NAMES[item.canteen_id] || item.canteen_id,
        items: [],
        total: 0
      });
      g.items.push(item);
      g.total += item.price * item.quantity;
      return acc;
    }, {})
  );

  const celebration = (
    <SuccessCelebration
      show={showSuccess}
      onClose={() => {
        setShowSuccess(false);
        navigate('/student/orders/tracking');
      }}
      title="Order Placed Successfully!"
      message={orderToken.includes('·') ? 'One token per canteen — show each at its counter' : 'Show your token number at the counter'}
      tokenNumber={orderToken}
    />
  );

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
        {celebration}
        <EmptyState
          type="cart"
          onAction={() => navigate('/student/dashboard')}
          actionText="Browse Menu"
          actionTestId="back-to-menu-btn"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {celebration}

      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-orange-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)} data-testid="back-btn">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <span className="text-xl font-bold gradient-text">Your Cart</span>
            </div>
            <span className="text-gray-600">{getCartItemCount()} items</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {groups.length > 1 && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <Store className="w-5 h-5 mt-0.5 shrink-0" />
            <p>Your cart has items from {groups.length} canteens. We'll place a separate order for each, and you'll get one pickup token per canteen.</p>
          </div>
        )}

        <div className="space-y-8">
          {groups.map((group) => (
          <section key={group.canteenId} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                <Store className="w-5 h-5 text-orange-500" />
                {group.name}
              </h2>
              <span className="text-sm font-semibold text-orange-600">₹{group.total.toFixed(2)}</span>
            </div>
          {group.items.map((item) => (
            <motion.div
              key={item.item_id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-orange-100"
              data-testid={`cart-item-${item.item_id}`}
            >
              <div className="flex items-center gap-4">
                <FoodImage src={item.image_url} alt={item.name} className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl shrink-0" iconClassName="w-8 h-8" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-600">{item.nutrition.calories} kcal</p>
                  <p className="text-orange-600 font-bold mt-1">₹{item.price}</p>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateQuantity(item.item_id, item.quantity - 1)}
                    className="rounded-full w-8 h-8 p-0"
                    data-testid={`decrease-qty-${item.item_id}`}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>

                  <span className="text-lg font-bold w-8 text-center" data-testid={`qty-${item.item_id}`}>
                    {item.quantity}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateQuantity(item.item_id, item.quantity + 1)}
                    className="rounded-full w-8 h-8 p-0"
                    data-testid={`increase-qty-${item.item_id}`}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveItem(item.item_id)}
                    className="text-red-500 hover:text-red-700"
                    data-testid={`remove-${item.item_id}`}
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
          </section>
          ))}
        </div>

        <div className="mt-8 bg-white rounded-2xl p-6 shadow-lg border border-orange-100">
          <div className="space-y-3">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax (0%)</span>
              <span>₹0.00</span>
            </div>
            <div className="border-t pt-3 flex justify-between text-xl font-bold">
              <span>Total</span>
              <span className="text-orange-600">₹{total.toFixed(2)}</span>
            </div>
          </div>

          <Button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full mt-6 py-6 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg"
            data-testid="checkout-btn"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              'Proceed to Payment'
            )}
          </Button>
        </div>
      </main>
    </div>
  );
}
