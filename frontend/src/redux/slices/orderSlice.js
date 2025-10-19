import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Fetch user orders
export const fetchUserOrders = createAsyncThunk('orders/fetchUserOrders', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/orders/my-orders`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` },
    });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

// Fetch order details
export const fetchOrderDeatils = createAsyncThunk('orders/fetchOrderDetails', async (orderId, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` },
    });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

// Cancel order
export const cancelOrder = createAsyncThunk('orders/cancelOrder', async (orderId, { rejectWithValue }) => {
  try {
    const response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/orders/${orderId}/cancel`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` },
    });
    return response.data.order;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

const orderSlice = createSlice({
  name: "orders",
  initialState: { orders: [], totalOrders: 0, orderDetails: null, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch user orders
      .addCase(fetchUserOrders.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchUserOrders.fulfilled, (state, action) => { state.loading = false; state.orders = action.payload; })
      .addCase(fetchUserOrders.rejected, (state, action) => { state.loading = false; state.error = action.payload.message; })

      // Fetch order details
      .addCase(fetchOrderDeatils.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchOrderDeatils.fulfilled, (state, action) => { state.loading = false; state.orderDetails = action.payload; })
      .addCase(fetchOrderDeatils.rejected, (state, action) => { state.loading = false; state.error = action.payload.message; })

      // Cancel order
      .addCase(cancelOrder.fulfilled, (state, action) => {
        if (state.orderDetails && state.orderDetails._id === action.payload._id) {
          state.orderDetails = action.payload;
        }
        const index = state.orders.findIndex(o => o._id === action.payload._id);
        if (index !== -1) state.orders[index] = action.payload;
      });
  },
});

export default orderSlice.reducer;
