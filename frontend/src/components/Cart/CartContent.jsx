import React from 'react';
import { RiDeleteBin3Line } from 'react-icons/ri';
import { useDispatch } from 'react-redux';
import { removeFromCart, updateCartItemQuantity } from '../../redux/slices/cartSlice';

const CartContent = ({ cart, userId, guestId }) => {
  const dispatch = useDispatch();

  // Handle adding or subtracting quantity
  const handleAddToCart = (productId, delta, quantity, size, color, enhanceCandle) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1) {
      dispatch(
        updateCartItemQuantity({
          productId,
          quantity: newQuantity,
          guestId,
          userId,
          size,
          color,
          enhanceCandle,
          extraPrice: enhanceCandle ? 3.99 : 0,
        })
      );
    }
  };

  const handleRemoveFromCart = (productId, size, color, enhanceCandle) => {
    dispatch(removeFromCart({ productId, guestId, userId, size, color, enhanceCandle }));
  };

  return (
    <div>
      {cart.products.map((product, index) => (
        <div key={index} className="flex items-start justify-between py-4 border-b">
          <div className="flex items-start">
            <img
              src={product.image}
              alt={product.name}
              className="w-20 h-24 object-cover mr-4 rounded"
            />
            <div>
              <h3>{product.name}</h3>
              <p className="text-sm text-gray-500">
                size: {product.size} | color: {product.color}
              </p>
              <div className="flex items-center mt-2">
                <button
                  onClick={() =>
                    handleAddToCart(
                      product.productId,
                      -1,
                      product.quantity,
                      product.size,
                      product.color,
                      product.enhanceCandle
                    )
                  }
                  className="border rounded px-2 py-1 text-xl font-medium"
                >
                  -
                </button>
                <span className="mx-4">{product.quantity}</span>
                <button
                  onClick={() =>
                    handleAddToCart(
                      product.productId,
                      1,
                      product.quantity,
                      product.size,
                      product.color,
                      product.enhanceCandle
                    )
                  }
                  className="border rounded px-2 py-1 text-xl font-medium"
                >
                  +
                </button>
              </div>
            </div>
          </div>
          <div>
            {/* Ensure price is numeric and include add-on price */}
            <p>
              $
              {(
                Number(product.price) +
                (product.enhanceCandle ? 3.99 : 0)
              ).toFixed(2)}
            </p>
            <button
              onClick={() =>
                handleRemoveFromCart(
                  product.productId,
                  product.size,
                  product.color,
                  product.enhanceCandle
                )
              }
            >
              <RiDeleteBin3Line className="h-6 w-6 mt-2 text-blue-600" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CartContent;
