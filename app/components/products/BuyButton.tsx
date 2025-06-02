'use client';

import { useState } from 'react';
import { Product } from '@/app/types';
import BuyModal from './BuyModal';

interface BuyButtonProps {
  product: Product;
}

export default function BuyButton({ product }: BuyButtonProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="w-full py-3 px-6 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
      >
        BUY
      </button>

      {showModal && (
        <BuyModal 
          product={product} 
          onClose={() => setShowModal(false)} 
        />
      )}
    </>
  );
}