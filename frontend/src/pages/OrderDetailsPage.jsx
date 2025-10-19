import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { fetchOrderDeatils, cancelOrder } from '../redux/slices/orderSlice';

const OrderDetailsPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { orderDetails, loading, error } = useSelector((state) => state.orders);
  const [localOrder, setLocalOrder] = useState(null);

  useEffect(() => { dispatch(fetchOrderDeatils(id)); }, [dispatch, id]);
  useEffect(() => { if (orderDetails) setLocalOrder(orderDetails); }, [orderDetails]);

  const handleCancel = () => { dispatch(cancelOrder(localOrder._id)); };

  if (loading) return <p>Loading ...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!localOrder) return <p>No Order details found</p>;

  return (
    <div className='max-w-7xl mx-auto p-4 sm:p-6'>
      <h2 className='text-2xl md:text-3xl font-bold mb-6'>Order Details</h2>

      <div className='p-4 sm:p-6 rounded-lg border'>
        {/* Order Info */}
        <div className='flex flex-col sm:flex-row justify-between mb-8'>
          <div>
            <h3 className='text-lg md:text-xl font-semibold'>Order Id: #{localOrder._id}</h3>
            <p className='text-gray-600'>
              {new Date(localOrder.createdAt).toLocaleDateString()}{' '}
              {new Date(localOrder.createdAt).toLocaleTimeString()}
            </p>
          </div>
          <div className='flex flex-col items-start sm:items-end mt-4 sm:mt-0 space-y-2'>
            <span className={`${localOrder.isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} px-3 py-1 rounded-full text-sm font-medium`}>
              {localOrder.isPaid ? 'Paid' : 'Pending Payment'}
            </span>
            <span className={`${localOrder.status === 'Delivered' ? 'bg-green-100 text-green-700' : localOrder.status === 'Shipped' ? 'bg-blue-100 text-blue-700' : localOrder.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'} px-3 py-1 rounded-full text-sm font-medium`}>
              {localOrder.status || 'Processing'}
            </span>
          </div>
        </div>

        {/* Cancel Order Button */}
        {localOrder.status !== 'Delivered' && localOrder.status !== 'Cancelled' && (
          <button onClick={handleCancel} className='bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 mb-4'>
            Cancel Order
          </button>
        )}

        {/* Customer, Payment, Shipping Info */}
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-8'>
          <div>
            <h4 className='text-lg font-semibold mb-2'>Payment Info</h4>
            <p>Payment Method: {localOrder.paymentMethod}</p>
            <p>Status: {localOrder.isPaid ? 'Paid' : 'Unpaid'}</p>
          </div>
          <div>
            <h4 className='text-lg font-semibold mb-2'>Shipping Info</h4>
            <p>Address: {localOrder.shippingAddress ? `${localOrder.shippingAddress.city}, ${localOrder.shippingAddress.country}` : 'N/A'}</p>
          </div>
        </div>

        {/* Product List */}
        <div className='overflow-x-auto'>
          <h4 className='text-lg font-semibold mb-4'>Products</h4>
          <table className='min-w-full text-gray-600 mb-4'>
            <thead className='bg-gray-100'>
              <tr>
                <th className='py-2 px-4 '>Name</th>
                <th className='py-2 px-4 '>Unit Price</th>
                <th className='py-2 px-4 '>Quantity</th>
                <th className='py-2 px-4 '>Total</th>
              </tr>
            </thead>
            <tbody>
              {localOrder.orderItems.map((item) => (
                <tr key={item.productId} className='border-b'>
                  <td className='py-2 px-4 flex items-center'>
                    <img src={item.image} alt={item.name} className='w-12 h-12 object-cover rounded-lg mr-4' />
                    <Link to={`/product/${item.productId}`} className='text-blue-500 hover:underline'>{item.name}</Link>
                  </td>
                  <td className='py-2 px-4'>${item.price}</td>
                  <td className='py-2 px-4'>{item.quantity}</td>
                  <td className='py-2 px-4'>${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Link to='/my-orders' className='text-blue-500 hover:underline'>Back to My Orders</Link>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
