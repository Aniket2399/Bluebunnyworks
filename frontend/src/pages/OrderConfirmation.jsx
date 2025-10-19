import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { clearCart } from "../redux/slices/cartSlice";
import axios from "axios";

const OrderConfirmation = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [checkout, setCheckout] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get Stripe session ID from query params
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    const fetchCheckout = async () => {
      try {
        if (!sessionId) {
          setLoading(false); // no session_id, stop loading and show message
          return;
        }

        // Fetch checkout by Stripe session ID
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/checkout/session/${sessionId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("userToken")}`,
            },
          }
        );

        const checkoutData = res.data;

        // Automatically finalize checkout if needed
        await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/checkout/${checkoutData._id}/finalize`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("userToken")}`,
            },
          }
        );

        setCheckout(checkoutData);

        // Clear cart
        dispatch(clearCart());
        localStorage.removeItem("cart");
      } catch (err) {
        console.error(err);
        setLoading(false); // on error, stop loading
      } finally {
        setLoading(false);
      }
    };

    fetchCheckout();
  }, [dispatch, sessionId]);

  const calculateEstimatedDelivery = (createdAt) => {
    const orderDate = new Date(createdAt);
    orderDate.setDate(orderDate.getDate() + 10);
    return orderDate.toLocaleDateString();
  };

  if (loading) return <p className="text-center mt-10">Processing your order...</p>;

  if (!sessionId) return <p className="text-center mt-10">No order to display.</p>;
  if (!checkout) return <p className="text-center mt-10">Order not found.</p>;
  console.log('Stripe session:', sessionId);
  console.log('Checkout isPaid:', checkout.isPaid);


  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      {/* Success Banner */}
      <div className="bg-emerald-100 border border-emerald-300 text-emerald-800 p-6 rounded-lg text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
        <p className="text-md">Thank you for your purchase. Your order has been confirmed.</p>
      </div>

      {/* Order Summary */}
      <div className="p-6 rounded-lg border mb-8">
        <div className="flex justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">Order ID: {checkout._id}</h2>
            <p className="text-gray-500">
              Order Date: {new Date(checkout.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-emerald-700 text-sm">
              Estimated Delivery: {calculateEstimatedDelivery(checkout.createdAt)}
            </p>
          </div>
        </div>

        <div className="mb-6">
          {checkout.checkoutItems.map((item) => (
            <div key={item.productId} className="flex items-center mb-4">
              <img
                src={item.image}
                alt={item.name}
                className="w-16 h-16 object-cover rounded-md mr-4"
              />
              <div>
                <h4 className="text-md font-semibold">{item.name}</h4>
                <p className="text-sm text-gray-500">{item.color} | {item.size}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-md">${item.price}</p>
                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-8 mb-6">
          <div>
            <h4 className="text-lg font-semibold mb-2">Payment</h4>
            <p className="text-gray-600">{checkout.paymentMethod}</p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-2">Delivery</h4>
            <p className="text-gray-600">{checkout.shippingAddress.address}</p>
            <p className="text-gray-600">
              {checkout.shippingAddress.city}, {checkout.shippingAddress.country}
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center border-t pt-4">
          <p className="font-semibold">Total</p>
          <p className="font-semibold">${checkout.totalPrice?.toLocaleString()}</p>
        </div>
      </div>

      {/* View Orders Button */}
      <div className="text-center">
        <button
          onClick={() => navigate("/my-orders")}
          className="bg-black text-white px-6 py-3 rounded hover:bg-gray-900 transition"
        >
          View All Orders
        </button>
      </div>
    </div>
  );
};

export default OrderConfirmation;
