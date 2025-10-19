import React from 'react'
import heroImg from  '../../assets/cover_image.png'
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className='relative'>
      <img 
      src={heroImg} 
      alt='Pace' 
      className='w-full h-[400px] md:h-[600px] lg:h-[750px] object-cover'
      />
      <div className='absolute inset-0 bg-black bg-opacity-5 flex items-start justify-start'>
      <div className='text-left text-white p-6 font-playfair md:font-cormorant'>
  <h1 className='text-4xl md:text-9xl font-bold tracking-tighter uppercase mb-4'>
    TRULY UNIQUE <br /> HOME FRAGRANCES
  </h1>
  <h2 className='text-lg text-yellow-400 md:text-3xl font-bold tracking-tighter mb-6 font-libre'>
    Transform your space with scents crafted to inspire comfort and elegance
  </h2>
  <p className='text-2xl tracking-tighter md:text-lg mb-6 font-crimson'>
    Discover candles and fragrances designed to elevate your everyday moments. 
    From fresh and floral to warm and cozy, our collection brings character 
    and charm to any room. Choose from curated sets or create your own blend 
    of signature scents to make your home truly yours.
  </p>
  <Link to='/products' className='bg-white text-gray-950 px-6 py-2 rounded-sm text-lg font-playfair'>
    Shop Now
  </Link>
</div>


      </div>
    
    
    </section>
  )
}

export default Hero