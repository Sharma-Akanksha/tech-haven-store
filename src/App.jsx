import { useState, useEffect } from "react";
import { motion } from "framer-motion";

// Mock product data
const PRODUCTS = [
  { id: 1, name: "Wireless Headphones", price: 89.99, image: "https://placehold.co/150x150/3b82f6/ffffff?text=🎧" },
  { id: 2, name: "Smart Watch", price: 199.99, image: "https://placehold.co/150x150/10b981/ffffff?text=⌚" },
  { id: 3, name: "Bluetooth Speaker", price: 59.99, image: "https://placehold.co/150x150/ef4444/ffffff?text=🔊" },
  { id: 4, name: "Laptop Stand", price: 34.99, image: "https://placehold.co/150x150/f59e0b/ffffff?text=💻" },
  { id: 5, name: "Phone Charger", price: 24.99, image: "https://placehold.co/150x150/8b5cf6/ffffff?text=⚡" },
  { id: 6, name: "Webcam", price: 79.99, image: "https://placehold.co/150x150/ec4899/ffffff?text=📷" },
];

const NTH_ORDER = 5; // Generate coupon BEFORE every nth order

export default function App() {
  // State management
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [orderCount, setOrderCount] = useState(0);
  const [currentActiveCoupon, setCurrentActiveCoupon] = useState(null);
  const [allCoupons, setAllCoupons] = useState([]);
  const [discountCode, setDiscountCode] = useState("");
  const [showCart, setShowCart] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [adminMessage, setAdminMessage] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  
  // ✅ CRITICAL FIX #1: Track if coupon is actively applied (not just attempted)
  const [isCouponApplied, setIsCouponApplied] = useState(false);
  // Track apply attempts for error messaging
  const [hasAttemptedApply, setHasAttemptedApply] = useState(false);

  // Calculate cart total
  const cartTotal = cart.reduce((total, item) => {
    const product = PRODUCTS.find(p => p.id === item.id);
    return total + (product.price * item.quantity);
  }, 0);

  // ✅ CRITICAL FIX #2: AUTO-RECALCULATE DISCOUNT WHEN CART CHANGES
  useEffect(() => {
    if (isCouponApplied && currentActiveCoupon && !currentActiveCoupon.used) {
      // Recalculate 10% discount based on NEW cart total
      const newDiscount = cartTotal * 0.1;
      setAppliedDiscount(newDiscount);
    }
  }, [cart, isCouponApplied, cartTotal, currentActiveCoupon]);

  // Add item to cart
  const addToCart = (productId) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === productId);
      if (existingItem) {
        return prevCart.map(item => 
          item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { id: productId, quantity: 1 }];
    });
    setShowCart(true);
  };

  // Remove item from cart
  const removeFromCart = (productId) => {
    setCart(prevCart => 
      prevCart.filter(item => item.id !== productId)
    );
  };

  // Update item quantity
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    setCart(prevCart => 
      prevCart.map(item => 
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // ✅ FIXED: Case-insensitive validation + track active coupon state
  const validateDiscountCode = () => {
    setHasAttemptedApply(true);
    
    // Clear discount if input is empty
    if (!discountCode.trim()) {
      setAppliedDiscount(0);
      setIsCouponApplied(false);
      return 0;
    }
    
    if (!currentActiveCoupon) {
      setAppliedDiscount(0);
      setIsCouponApplied(false);
      return 0;
    }
    
    // Normalize BOTH values to uppercase
    const userInput = discountCode.trim().toUpperCase();
    const activeCode = currentActiveCoupon.code.toUpperCase();
    
    if (activeCode === userInput && !currentActiveCoupon.used) {
      const discount = cartTotal * 0.1;
      setAppliedDiscount(discount);
      setIsCouponApplied(true); // ✅ Mark coupon as actively applied
      return discount;
    }
    
    // Invalid coupon
    setAppliedDiscount(0);
    setIsCouponApplied(false);
    return 0;
  };

  // Reset attempt flag when discount code changes
  useEffect(() => {
    if (hasAttemptedApply && discountCode.trim() === "") {
      setHasAttemptedApply(false);
    }
  }, [discountCode, hasAttemptedApply]);

  // Checkout process
  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    // Validate discount before processing order
    const discountAmount = validateDiscountCode();
    const finalAmount = cartTotal - discountAmount;
    
    // Create order object
    const newOrder = {
      id: orderCount + 1,
      items: cart.map(item => {
        const product = PRODUCTS.find(p => p.id === item.id);
        return {
          id: item.id,
          name: product.name,
          price: product.price,
          quantity: item.quantity,
          total: product.price * item.quantity
        };
      }),
      totalAmount: cartTotal,
      discountAmount: discountAmount,
      finalAmount: finalAmount,
      discountCodeUsed: discountAmount > 0 ? discountCode.trim().toUpperCase() : null,
      date: new Date().toISOString()
    };
    
    // Update orders and order count
    setOrders(prev => [...prev, newOrder]);
    const newOrderCount = orderCount + 1;
    setOrderCount(newOrderCount);
    
    // Mark coupon as used if applied
    if (discountAmount > 0 && currentActiveCoupon) {
      setCurrentActiveCoupon(prev => prev ? { ...prev, used: true } : null);
      
      // Update allCoupons history
      setAllCoupons(prev => 
        prev.map(coupon => 
          coupon.code === currentActiveCoupon.code 
            ? { ...coupon, used: true, usedAtOrder: newOrderCount } 
            : coupon
        )
      );
    }
    
    // ✅ Generate coupon FOR THE NEXT NTH ORDER
    const nextOrderNumber = newOrderCount + 1;
    if (nextOrderNumber % NTH_ORDER === 0) {
      const existingCoupon = allCoupons.find(c => c.generatedAtOrder === nextOrderNumber);
      if (!existingCoupon) {
        const newCouponCode = `SAVE${nextOrderNumber}NOW`.toUpperCase();
        const newCoupon = {
          code: newCouponCode,
          generatedAtOrder: nextOrderNumber,
          used: false,
          usedAtOrder: null
        };
        
        setCurrentActiveCoupon({ code: newCouponCode, used: false });
        setAllCoupons(prev => [...prev, newCoupon]);
        
        // Optional user notification
        if (nextOrderNumber === NTH_ORDER) {
          setTimeout(() => {
            alert(`🎉 Special offer unlocked! Use code ${newCouponCode} for 10% off your ${NTH_ORDER}th order!`);
          }, 300);
        }
      }
    }
    
    // ✅ CRITICAL: Reset ALL coupon states after checkout
    setCart([]);
    setDiscountCode("");
    setAppliedDiscount(0);
    setIsCouponApplied(false);
    setHasAttemptedApply(false);
    setShowCart(false);
    setCheckoutSuccess(true);
    
    setTimeout(() => setCheckoutSuccess(false), 3000);
  };

  // Admin: Generate discount code manually
  const generateDiscountCode = () => {
    const nextOrderNumber = orderCount + 1;
    
    if (nextOrderNumber % NTH_ORDER !== 0) {
      setAdminMessage(
        `Error: Coupon can only be generated when NEXT order (#${nextOrderNumber}) ` +
        `will be the ${NTH_ORDER}th order. Current orders: ${orderCount}`
      );
      setTimeout(() => setAdminMessage(""), 5000);
      return;
    }
    
    const existingCoupon = allCoupons.find(c => c.generatedAtOrder === nextOrderNumber);
    if (existingCoupon) {
      setAdminMessage(`Error: Coupon already generated for order #${nextOrderNumber}`);
      setTimeout(() => setAdminMessage(""), 5000);
      return;
    }
    
    const newCouponCode = `ADMIN${nextOrderNumber}SAVE`.toUpperCase();
    const newCoupon = {
      code: newCouponCode,
      generatedAtOrder: nextOrderNumber,
      used: false,
      usedAtOrder: null
    };
    
    setCurrentActiveCoupon({ code: newCouponCode, used: false });
    setAllCoupons(prev => [...prev, newCoupon]);
    setAdminMessage(`Success: Coupon ${newCouponCode} generated for order #${nextOrderNumber}!`);
    setTimeout(() => setAdminMessage(""), 5000);
  };

  // Admin: Get statistics
  const getAdminStats = () => {
    const totalItemsPurchased = orders.reduce((total, order) => 
      total + order.items.reduce((sum, item) => sum + item.quantity, 0), 0);
    
    const totalPurchaseAmount = orders.reduce((sum, order) => sum + order.finalAmount, 0);
    const totalDiscountAmount = orders.reduce((sum, order) => sum + order.discountAmount, 0);
    
    return {
      totalItemsPurchased,
      totalPurchaseAmount: totalPurchaseAmount.toFixed(2),
      totalDiscountAmount: totalDiscountAmount.toFixed(2),
      discountCodes: [...allCoupons].reverse()
    };
  };

  // Close cart when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showCart && event.target.id === "cart-overlay") {
        setShowCart(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showCart]);

  // Admin stats
  const stats = getAdminStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 px-6 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <div className="bg-indigo-600 text-white p-2 rounded-lg">
            <span className="font-bold text-xl">🛒</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Tech Haven Store</h1>
        </div>
        <div className="flex items-center space-x-6">
          <button 
            onClick={() => setShowCart(true)}
            className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="View cart"
          >
            <span className="text-gray-700 text-xl">🛒</span>
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </button>
          <button 
            onClick={() => setShowAdmin(!showAdmin)}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              showAdmin 
                ? "bg-indigo-600 text-white" 
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {showAdmin ? "Hide Admin Panel" : "Admin Panel"}
          </button>
        </div>
      </header>

      {/* Admin Panel */}
      {showAdmin && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white shadow-md rounded-xl p-6 mx-6 my-4 border border-indigo-100"
        >
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Admin Dashboard</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Total Orders</p>
                  <p className="text-2xl font-bold text-blue-600">{orderCount}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600">${stats.totalPurchaseAmount}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Total Items Sold</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.totalItemsPurchased}</p>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="font-bold text-lg text-gray-800 mb-3">Discount Codes History</h3>
                {stats.discountCodes.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {stats.discountCodes.map((coupon, index) => (
                      <div 
                        key={index} 
                        className={`p-3 rounded-lg flex justify-between items-center ${
                          coupon.used 
                            ? "bg-red-50 border border-red-200" 
                            : "bg-green-50 border border-green-200"
                        }`}
                      >
                        <span className="font-mono font-bold">{coupon.code}</span>
                        <div className="text-sm">
                          <div>For order #{coupon.generatedAtOrder}</div>
                          {coupon.used ? (
                            <div className="text-red-600">Used at order #{coupon.usedAtOrder}</div>
                          ) : (
                            <div className="text-green-600">Active for next order</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No discount codes generated yet</p>
                )}
              </div>
              
              <div className="mb-4">
                <h3 className="font-bold text-lg text-gray-800 mb-3">Total Discount Amount</h3>
                <p className="text-2xl font-bold text-indigo-600">${stats.totalDiscountAmount}</p>
              </div>
            </div>
            
            <div className="ml-8 w-80">
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-6">
                <h3 className="font-bold text-lg text-gray-800 mb-2">Generate Discount Code</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Generate coupon for the NEXT order if it will be the {NTH_ORDER}th order
                </p>
                <button
                  onClick={generateDiscountCode}
                  className="w-full bg-amber-400 hover:bg-amber-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                  Generate Coupon
                </button>
                {adminMessage && (
                  <p className={`mt-2 text-sm font-medium ${
                    adminMessage.includes("Error") ? "text-red-500" : "text-green-600"
                  }`}>
                    {adminMessage}
                  </p>
                )}
              </div>
              
              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                <h3 className="font-bold text-lg text-gray-800 mb-2">Current Active Coupon</h3>
                {currentActiveCoupon ? (
                  <div>
                    <p className="font-mono text-2xl font-bold text-indigo-700 mb-1">
                      {currentActiveCoupon.code}
                    </p>
                    <p className={`text-sm font-medium ${
                      currentActiveCoupon.used 
                        ? "text-red-500" 
                        : "text-green-600"
                    }`}>
                      {currentActiveCoupon.used 
                        ? "❌ Already used" 
                        : `✅ Valid for order #${allCoupons.find(c => c.code === currentActiveCoupon.code)?.generatedAtOrder}`}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Generated for order #{allCoupons.find(c => c.code === currentActiveCoupon.code)?.generatedAtOrder}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">
                    No active coupon. Will generate after order #{NTH_ORDER - 1}
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Products Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Featured Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {PRODUCTS.map(product => (
            <motion.div
              key={product.id}
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transition-shadow hover:shadow-lg"
            >
              <div className="h-48 flex items-center justify-center bg-gray-50">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="max-h-36 w-auto"
                />
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg text-gray-800 mb-1">{product.name}</h3>
                <p className="text-2xl font-bold text-indigo-600 mb-3">${product.price.toFixed(2)}</p>
                <button
                  onClick={() => addToCart(product.id)}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <span>🛒</span>
                  <span>Add to Cart</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Cart Sidebar */}
      {showCart && (
        <div 
          id="cart-overlay" 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
        >
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col"
          >
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Your Cart</h2>
              <button 
                onClick={() => setShowCart(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
                aria-label="Close cart"
              >
                &times;
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">🛒</div>
                  <p className="text-gray-500 text-lg">Your cart is empty</p>
                  <button
                    onClick={() => setShowCart(false)}
                    className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map(item => {
                    const product = PRODUCTS.find(p => p.id === item.id);
                    return (
                      <div key={item.id} className="flex items-center space-x-4 py-4 border-b border-gray-100">
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="w-16 h-16 object-contain"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-800">{product.name}</h3>
                          <p className="text-indigo-600 font-bold">${product.price.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                          >
                            +
                          </button>
                        </div>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-400 hover:text-red-500 text-xl"
                          aria-label={`Remove ${product.name} from cart`}
                        >
                          &times;
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            {cart.length > 0 && (
              <div className="border-t border-gray-200 p-6 bg-gray-50">
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-lg">
                    <span>Subtotal:</span>
                    <span className="font-bold">${cartTotal.toFixed(2)}</span>
                  </div>
                  
                  <div>
                    <div className="flex space-x-2 mb-2">
                      <input
                        type="text"
                        value={discountCode}
                        onChange={(e) => {
                          setDiscountCode(e.target.value);
                          // ✅ Auto-remove discount if user modifies code after applying
                          if (isCouponApplied) {
                            setIsCouponApplied(false);
                            setAppliedDiscount(0);
                          }
                        }}
                        placeholder="Enter discount code"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <button
                        onClick={validateDiscountCode}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                    
                    {/* ✅ Show success message when coupon is actively applied */}
                    {isCouponApplied && appliedDiscount > 0 && (
                      <p className="text-green-600 font-medium mt-1">
                        ✓ 10% discount applied! (-${appliedDiscount.toFixed(2)}) • Updates automatically as cart changes
                      </p>
                    )}
                    
                    {/* ✅ Only show error AFTER clicking Apply AND it fails */}
                    {hasAttemptedApply && discountCode.trim() !== "" && !isCouponApplied && (
                      <p className="text-red-500 text-sm mt-1">
                        Invalid or expired coupon code
                      </p>
                    )}
                    
                    {/* Helpful hint when no code entered but coupon exists */}
                    {currentActiveCoupon && !currentActiveCoupon.used && !isCouponApplied && !discountCode.trim() && (
                      <p className="text-amber-600 text-sm mt-1">
                        💡 Active coupon: {currentActiveCoupon.code} (Valid for order #{allCoupons.find(c => c.code === currentActiveCoupon.code)?.generatedAtOrder})
                      </p>
                    )}
                  </div>
                  
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total:</span>
                    <span className="text-indigo-600">${(cartTotal - appliedDiscount).toFixed(2)}</span>
                  </div>
                </div>
                
                <button
                  onClick={handleCheckout}
                  disabled={cart.length === 0}
                  className={`w-full py-3 px-4 rounded-lg font-bold text-lg transition-colors ${
                    cart.length === 0
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white"
                  }`}
                >
                  Checkout
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Checkout Success Notification */}
      {checkoutSuccess && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-4 rounded-xl shadow-lg z-50 flex items-center space-x-3"
        >
          <span className="text-2xl">✓</span>
          <div>
            <p className="font-bold">Order Placed Successfully!</p>
            <p className="text-sm opacity-90">Thank you for your purchase</p>
          </div>
        </motion.div>
      )}

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-12 px-6 mt-16">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center space-x-6 mb-6">
            <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center">
              <span className="text-2xl font-bold">T</span>
            </div>
          </div>
          <p className="text-lg mb-4 font-medium">
            🎁 Place {NTH_ORDER - 1} orders to unlock 10% off your {NTH_ORDER}th order!
          </p>
          <p className="text-sm">
            © {new Date().getFullYear()} Tech Haven Store. All rights reserved.
          </p>
          <p className="text-xs mt-2 opacity-75">
            This is a demo store. No actual purchases will be processed.
          </p>
        </div>
      </footer>
    </div>
  );
}