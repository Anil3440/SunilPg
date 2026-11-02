import React, { useState, useEffect } from 'react';
import { menuApi, canteenOrderApi } from '../../api';
import { 
  Utensils, 
  ShoppingBag, 
  Plus, 
  Minus, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Coffee, 
  Truck, 
  Store,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

export const StudentCanteen = () => {
  const [todayMenu, setTodayMenu] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [deliveryType, setDeliveryType] = useState('ROOM_DELIVERY');
  const [paymentMethod, setPaymentMethod] = useState('PAY_AT_COUNTER');
  const [instructions, setInstructions] = useState('');
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [activeTab, setActiveTab] = useState('MENU_AND_ORDER'); // 'MENU_AND_ORDER' | 'MY_ORDERS'

  // Catalog of standard and extra orderable canteen food items
  const defaultCanteenCatalog = [
    { id: '1', name: 'Classic Butter Maggi Noodles', category: 'SNACKS', price: 40, desc: 'Hot Maggi with butter & veggies' },
    { id: '2', name: 'Crispy Veg Samosa (2 pcs)', category: 'SNACKS', price: 30, desc: 'Served with sweet tamarind & mint chutney' },
    { id: '3', name: 'Cheese Grilled Sandwich', category: 'SNACKS', price: 60, desc: 'Loaded melted mozzarella cheese & spices' },
    { id: '4', name: 'Special Chicken Curry Bowl', category: 'LUNCH', price: 90, desc: 'Home-style gravy with tender chicken' },
    { id: '5', name: 'Extra Boiled Eggs (2 pcs)', category: 'BREAKFAST', price: 20, desc: 'Farm-fresh boiled eggs with pepper' },
    { id: '6', name: 'Egg Bhurji Plate (2 eggs)', category: 'DINNER', price: 50, desc: 'Scrambled eggs with onions and coriander' },
    { id: '7', name: 'Chilled Sweet Lassi', category: 'BEVERAGES', price: 35, desc: 'Thick creamy punjabi sweet lassi' },
    { id: '8', name: 'Fresh Cold Coffee with Ice Cream', category: 'BEVERAGES', price: 50, desc: 'Frothy chocolate cold coffee' },
    { id: '9', name: 'Hot Filter Coffee / Milk Tea', category: 'BEVERAGES', price: 15, desc: 'Authentic South Indian aromatic brew' },
    { id: '10', name: 'Gulab Jamun (2 pcs)', category: 'SNACKS', price: 30, desc: 'Soft warm dessert in saffron syrup' },
  ];

  const loadData = async () => {
    try {
      const [menuRes, ordersRes] = await Promise.all([
        menuApi.getToday(),
        canteenOrderApi.getMyOrders(),
      ]);
      if (menuRes.data.success) setTodayMenu(menuRes.data.data);
      if (ordersRes.data.success) setActiveOrders(ordersRes.data.data);
    } catch (err) {
      toast.error('Failed to load canteen details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.name === item.name);
      if (existing) {
        return prev.map((i) =>
          i.name === item.name ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { name: item.name, price: item.price, quantity: 1 }];
    });
    toast.success(`Added ${item.name} to cart`);
  };

  const updateQuantity = (name, delta) => {
    setCart((prev) => {
      return prev
        .map((i) => {
          if (i.name === name) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean);
    });
  };

  const cartTotal = cart.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      toast.error('Your food cart is empty');
      return;
    }
    setSubmittingOrder(true);
    try {
      const res = await canteenOrderApi.placeOrder({
        items: cart,
        deliveryType,
        paymentMethod,
        specialInstructions: instructions,
      });
      if (res.data.success) {
        toast.success(res.data.message || 'Order placed successfully!');
        setCart([]);
        setInstructions('');
        setActiveTab('MY_ORDERS');
        loadData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setSubmittingOrder(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Hostel Canteen & Food Ordering
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Check today's meal schedule and order fresh snacks & extra dishes directly from the kitchen
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-gray-100 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('MENU_AND_ORDER')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'MENU_AND_ORDER'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Utensils className="w-4 h-4 text-emerald-600" /> Menu & Order
          </button>
          <button
            onClick={() => setActiveTab('MY_ORDERS')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'MY_ORDERS'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-primary-600" /> My Orders ({activeOrders.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : activeTab === 'MY_ORDERS' ? (
        /* MY ORDERS TRACKER TAB */
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">Your Active & Past Canteen Orders</h2>
            <button
              onClick={() => setActiveTab('MENU_AND_ORDER')}
              className="btn btn-outline text-xs py-1.5"
            >
              + Place New Order
            </button>
          </div>

          {activeOrders.length === 0 ? (
            <div className="card text-center py-16 text-gray-400">
              <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="font-bold text-gray-700">No Food Orders Yet</p>
              <p className="text-xs text-gray-500 mt-1">
                Order sandwiches, Maggie, cold coffee or special dishes from the menu!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeOrders.map((ord) => (
                <div key={ord._id} className="card p-6 flex flex-col sm:flex-row justify-between gap-6">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold px-2.5 py-1 bg-gray-100 rounded-lg text-gray-800">
                        {ord.orderNumber}
                      </span>
                      <span
                        className={`badge ${
                          ord.orderStatus === 'DELIVERED'
                            ? 'badge-success'
                            : ord.orderStatus === 'CANCELLED'
                            ? 'badge-danger'
                            : 'badge-warning'
                        }`}
                      >
                        {ord.orderStatus}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(ord.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="space-y-1">
                      {ord.items?.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm text-gray-800 max-w-md">
                          <span>
                            {item.quantity} × {item.name}
                          </span>
                          <span className="font-semibold text-gray-900">
                            ₹{item.price * item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>

                    {ord.specialInstructions && (
                      <p className="text-xs text-amber-800 bg-amber-50 p-2 rounded-lg max-w-md">
                        Note: "{ord.specialInstructions}"
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>Delivery: <strong>{ord.deliveryType === 'ROOM_DELIVERY' ? 'Room Delivery' : 'Pickup at Canteen'}</strong></span>
                      <span>• Payment: <strong>{ord.paymentMethod}</strong> ({ord.paymentStatus})</span>
                    </div>
                  </div>

                  <div className="sm:text-right flex sm:flex-col justify-between items-end">
                    <div>
                      <span className="text-xs text-gray-400 block">Total Amount</span>
                      <span className="text-2xl font-black text-gray-900">
                        ₹{ord.totalAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded">
                      {ord.orderStatus === 'DELIVERED' ? 'Completed' : 'Kitchen Processing'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* MENU & ORDER TAB */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: Today's Schedule & Canteen Dishes Catalog */}
          <div className="lg:col-span-2 space-y-8">
            {/* Today's Included Meal Timetable */}
            <div className="card p-6">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-100 mb-4">
                <Utensils className="w-5 h-5 text-emerald-600" />
                <h2 className="text-lg font-bold text-gray-900">Today's Regular Hostel Food Menu</h2>
              </div>

              {todayMenu.length === 0 ? (
                <p className="text-xs text-gray-400 py-4">No regular menu published for today.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {['BREAKFAST', 'LUNCH', 'DINNER'].map((meal) => {
                    const item = todayMenu.find((m) => m.mealType === meal);
                    return (
                      <div key={meal} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block mb-1">
                            {meal}
                          </span>
                          <p className="text-xs text-gray-800 leading-relaxed font-medium">
                            {item?.items?.join(', ') || 'Standard mess meal'}
                          </p>
                        </div>
                        <span className="text-[10px] text-gray-400 mt-3 pt-2 border-t border-gray-200 block">
                          Included in hostel fees
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Extra Orderable Food Items & Snacks Catalog */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Order Snacks, Specials & Beverages</h2>
                  <p className="text-xs text-gray-500">Prepared fresh to order in the PG kitchen</p>
                </div>
                <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-bold">
                  Kitchen Open Now
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {defaultCanteenCatalog.map((dish) => (
                  <div key={dish.id} className="card p-4 flex justify-between items-center hover:shadow-md transition">
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                        {dish.category}
                      </span>
                      <h4 className="font-bold text-sm text-gray-900 mt-1">{dish.name}</h4>
                      <p className="text-[11px] text-gray-500 mt-0.5">{dish.desc}</p>
                      <div className="text-sm font-black text-emerald-700 mt-2">
                        ₹{dish.price}
                      </div>
                    </div>
                    <button
                      onClick={() => addToCart(dish)}
                      className="btn btn-outline text-xs py-1.5 px-3 flex items-center gap-1 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800 flex-shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Food Cart */}
          <div className="card p-6 sticky top-20 shadow-md border-primary-100">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary-600" />
                <h3 className="font-extrabold text-gray-900 text-base">Your Food Cart</h3>
              </div>
              <span className="badge-info text-xs">{cart.length} items</span>
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-xs font-bold text-gray-600">Your cart is empty</p>
                <p className="text-[11px] text-gray-400 mt-1">
                  Click "+ Add" on any dish or beverage to start ordering.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
                  {cart.map((item) => (
                    <div key={item.name} className="flex justify-between items-center text-xs">
                      <div className="max-w-[130px]">
                        <p className="font-bold text-gray-900 truncate">{item.name}</p>
                        <p className="text-gray-500">₹{item.price} each</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.name, -1)}
                          className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-200"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-bold text-sm w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.name, 1)}
                          className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-200"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <span className="font-black text-gray-900 w-12 text-right">
                          ₹{item.price * item.quantity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-gray-100 space-y-3">
                  <div>
                    <label className="label text-xs">Delivery Preference</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setDeliveryType('ROOM_DELIVERY')}
                        className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                          deliveryType === 'ROOM_DELIVERY'
                            ? 'bg-primary-50 border-primary-600 text-primary-700'
                            : 'border-gray-200 text-gray-600'
                        }`}
                      >
                        <Truck className="w-3.5 h-3.5" /> Room Delivery
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeliveryType('CANTEEN_PICKUP')}
                        className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                          deliveryType === 'CANTEEN_PICKUP'
                            ? 'bg-primary-50 border-primary-600 text-primary-700'
                            : 'border-gray-200 text-gray-600'
                        }`}
                      >
                        <Store className="w-3.5 h-3.5" /> Canteen Pickup
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="label text-xs">Payment Method</label>
                    <select
                      className="input text-xs py-1.5"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                      <option value="PAY_AT_COUNTER">Pay at Canteen Counter / Cash on Delivery</option>
                      <option value="ONLINE">Paid Online (UPI / Card)</option>
                      <option value="ADDED_TO_BILL">Add to Monthly Hostel Bill</option>
                    </select>
                  </div>

                  <div>
                    <label className="label text-xs">Special Instructions (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Extra spicy, less sugar, deliver at 5 PM"
                      className="input text-xs"
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                    />
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex justify-between items-center text-sm font-bold">
                    <span>Payable Total:</span>
                    <span className="text-xl font-black text-emerald-700">
                      ₹{cartTotal.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <button
                    onClick={handlePlaceOrder}
                    disabled={submittingOrder}
                    className="btn btn-primary w-full py-3 font-bold text-sm shadow-md"
                  >
                    {submittingOrder ? 'Placing Order...' : `Confirm & Place Order (₹${cartTotal})`}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

