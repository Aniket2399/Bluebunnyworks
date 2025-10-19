import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const StripeButton = ({ checkoutId, onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!checkoutId) {
      alert("Checkout not ready. Please try again.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("userToken");

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/checkout/${checkoutId}/stripe-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!data?.id) {
        alert("Failed to create Stripe session");
        setLoading(false);
        return;
      }

      const stripe = await stripePromise;

      const { error } = await stripe.redirectToCheckout({
        sessionId: data.id,
      });

      if (error) {
        console.error(error);
        onError?.(error);
      }
    } catch (err) {
      console.error(err);
      onError?.(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className="bg-black text-white px-6 py-2 rounded hover:bg-gray-900"
    >
      {loading ? "Redirecting..." : "Pay with Stripe"}
    </button>
  );
};

export default StripeButton;
