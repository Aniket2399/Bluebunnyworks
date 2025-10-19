import React, { useState } from 'react'
import { Link } from 'react-router-dom';
import logo from '../../assets/bw_logo.png'
import { HiOutlineUser, HiOutlineShoppingBag, HiBars3BottomRight } from 'react-icons/hi2'
import SearchBar from './SearchBar';
import CartDrawer from '../Layout/CartDrawer';
import { IoMdClose } from 'react-icons/io';
import { useSelector } from 'react-redux';

const Navbar = () => {

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [navDrawerOpen, setNavDrawerOpen] = useState(false);
  const { cart } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  const cartItemCount = cart?.products?.reduce(
    (total, product) => total + product.quantity,
    0
  ) || 0;

  const toggleNavDrawer = () => {
    setNavDrawerOpen(!navDrawerOpen);
  }

  const toggleCartDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return ( 
    <>
      <nav className="px-6 mx-auto flex items-center justify-between py-1">
        {/* Left - Logo */}
        <div>
          <Link 
            to="/" 
            className="flex items-center space-x-1 text-[60px] font-bold italic font-bluebunny text-bluebunny"
          >
            <img 
              src={logo} 
              alt="Bluebunny Logo" 
              className="h-16 w-16 object-contain"
            />
            <span>BlueBunny Works</span>
          </Link>
        </div>

        {/* Center - Explore All Products */}
        <div className="hidden md:flex flex-1 justify-center items-start">
          <Link 
            to="/products" 
            className="text-gray-700 hover:text-black text-sm font-bold uppercase"
          >
            Explore All Products
          </Link>
        </div>

        {/* Right - Icons */}
        <div className="flex items-center space-x-4">
          {user && user.role === "admin" && (
            <Link 
              to='/admin' 
              className="block bg-black px-2 rounded text-sm text-white"
            >
              Admin
            </Link>
          )}

          <Link to="/profile" className="hover:text-black">
            <HiOutlineUser className="h-6 w-6 tex-gray-700" />
          </Link>

          <button onClick={toggleCartDrawer} className="relative hover:text-black">
            <HiOutlineShoppingBag className="h-6 w-6 text-gray-700" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 bg-Pace-blue text-white text-xs rounded-full px-2 py-0.5">
                {cartItemCount}
              </span>
            )}
          </button>

          <div className="overflow-hidden">
            <SearchBar />
          </div>

          <button onClick={toggleNavDrawer} className="md:hidden">
            <HiBars3BottomRight className="h-6 w-6 text-gray-700" />
          </button>
        </div>
      </nav>

      {/* Cart Drawer */}
      <CartDrawer drawerOpen={drawerOpen} toggleCartDrawer={toggleCartDrawer}/>

      {/* Mobile Navigation */}
      <div 
        className={`fixed top-0 left-0 w-3/4 sm:w-1/2 md:w-1/3 h-full bg-white shadow-lg transform transition-transform duration-300 z-50 ${
          navDrawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-end p-4">
          <button onClick={toggleNavDrawer}>
            <IoMdClose className="h-6 w-6 text-gray-600"/>
          </button>
        </div>
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-4">Menu</h2>
          <nav className="space-y-4">
            <Link 
              to="/products"
              onClick={toggleNavDrawer} 
              className="block text-gray-600 hover:text-black"
            >
              Explore All Products
            </Link>
          </nav>
        </div>
      </div>
    </>
  )
}

export default Navbar
