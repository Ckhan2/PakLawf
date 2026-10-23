import { useMemo, useState } from "react";
import Confetti from "react-confetti";
import { useWindowSize } from "@react-hook/window-size";
import { useNavigate } from "react-router-dom";
import { useCart } from "../Context/CartContext";
import { usePlaceOrderMutation } from "../store/hooks";
import { showSuccess, showError } from "../utils/toast";

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  street: "",
  city: "",
  state: "",
  zipcode: "",
  country: "Pakistan",
};

const OrderForm = () => {
  const navigate = useNavigate();
  const { cartItems, cartTotal, addOrderNotification, clearCart } = useCart();
  const [placeOrder, { isLoading }] = usePlaceOrderMutation();
  const [formData, setFormData] = useState(initialForm);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [width, height] = useWindowSize();

  const orderItems = useMemo(
    () =>
      cartItems.map((item) => ({
        _id: item._id,
        name: item.title || item.name,
        price: Number(item.price) || 0,
        quantity: Number(item.quantity) || 1,
      })),
    [cartItems]
  );

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!orderItems.length) {
      showError("Your cart is empty. Add books before placing an order.");
      return;
    }

    const orderData = {
      items: orderItems,
      amount: cartTotal,
      address: {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        street: formData.street.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        zipcode: formData.zipcode.trim(),
        country: formData.country.trim() || "Pakistan",
        phone: formData.phone.trim(),
      },
    };

    try {
      const result = await placeOrder(orderData).unwrap();

      if (result?.success === false) {
        showError(result?.message || "Failed to place order.");
        return;
      }

      addOrderNotification({
        customerName: `${orderData.address.firstName} ${orderData.address.lastName}`.trim(),
        email: orderData.address.email,
        phone: orderData.address.phone,
        productName: orderItems.map((item) => item.name).join(", "),
        quantity: orderItems.reduce((sum, item) => sum + item.quantity, 0),
        address: `${orderData.address.street}, ${orderData.address.city}`,
        deliveryAddress: `${orderData.address.street}, ${orderData.address.city}`,
        paymentMethod: "cash on delivery",
        items: cartItems,
        total: cartTotal,
        orderId: result?.orderId,
      });

      clearCart();
      setFormData(initialForm);
      setOrderPlaced(true);
      showSuccess(result?.message || "Order placed successfully!");
    } catch (error) {
      showError(error?.data?.message || error?.message || "Failed to place order.");
    }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Confetti width={width} height={height} numberOfPieces={300} recycle={false} />

        <div className="bg-slate-900 border border-slate-700 p-8 rounded-2xl shadow-2xl text-center max-w-md">
          <div className="text-7xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-amber-400 mb-3">Order Placed Successfully!</h1>
          <p className="text-gray-400 mb-5">
            Thank you for shopping with us. Your order will be delivered soon!
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setOrderPlaced(false)}
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition"
            >
              Place Another Order
            </button>
            <button
              onClick={() => navigate("/")}
              className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg transition"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 shadow-2xl rounded-xl p-8">
        <h2 className="text-3xl font-bold text-center text-amber-400 mb-6">Place Your Order</h2>

        {cartItems.length > 0 ? (
          <div className="mb-6 rounded-lg border border-slate-700 bg-slate-800/50 p-4 text-sm text-slate-300">
            <p className="font-semibold text-amber-400 mb-2">Cart Summary</p>
            {cartItems.map((item) => (
              <p key={item._id}>
                {item.title || item.name} x{item.quantity}
              </p>
            ))}
            <p className="mt-2 font-semibold text-white">Total: Rs. {cartTotal.toFixed(2)}</p>
          </div>
        ) : (
          <div className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-300">
            Your cart is empty. Add books before placing an order.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-amber-400 mb-1">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-amber-400 mb-1">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-amber-400 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-amber-400 mb-1">Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-amber-400 mb-1">Street Address</label>
            <input
              type="text"
              name="street"
              value={formData.street}
              onChange={handleChange}
              required
              className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-amber-400 mb-1">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-amber-400 mb-1">State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
                className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-amber-400 mb-1">Zip Code</label>
              <input
                type="text"
                name="zipcode"
                value={formData.zipcode}
                onChange={handleChange}
                required
                className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-amber-400 mb-1">Country</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
                className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !cartItems.length}
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white py-3 rounded-lg font-semibold transition"
          >
            {isLoading ? "Placing Order..." : "Place Order"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OrderForm;
