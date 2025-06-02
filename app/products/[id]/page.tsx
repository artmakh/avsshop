import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getProductById, getProductImages, getUserById, getBidsByProductId } from '@/app/lib/db';
import { getUser } from '@/app/lib/auth';
import DeleteProductButton from '@/app/components/products/DeleteProductButton';
import BuyButton from '@/app/components/products/BuyButton';
import BidButton from '@/app/components/products/BidButton';
import { processEndedAuctions } from '@/app/lib/auction-processor';
import { Product, ProductImage, Bid } from '@/app/types';

interface UserData {
  id: number;
  username: string;
  password: string;
  is_admin: number;
  created_at: string;
  updated_at: string;
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const productId = parseInt(id);
  
  // Process any ended auctions before displaying the product
  try {
    await processEndedAuctions();
  } catch (error) {
    console.error('Error processing ended auctions:', error);
  }
  
  const product = getProductById.get(productId) as Product;
  
  if (!product) {
    notFound();
  }

  const images = getProductImages.all(productId) as ProductImage[];
  const bids = product.listing_type === 'auction' ? getBidsByProductId.all(productId) as Bid[] : [];
  
  // Check if current user owns this product or is admin
  const currentUser = await getUser();
  let canDelete = false;
  if (currentUser) {
    const userData = getUserById.get(currentUser.userId) as UserData;
    canDelete = product.seller_id === currentUser.userId || userData?.is_admin === 1;
  }

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
            {/* Images Section */}
            <div className="space-y-4">
              {images.length > 0 ? (
                <>
                  <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={images[0].image_url}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority
                    />
                  </div>
                  {images.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {images.slice(1).map((image, index) => (
                        <div key={image.id} className="aspect-square relative bg-gray-100 rounded overflow-hidden">
                          <Image
                            src={image.image_url}
                            alt={`${product.name} ${index + 2}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 25vw, 12.5vw"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400">No image available</span>
                </div>
              )}
            </div>

            {/* Product Info Section */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Sold by <Link href={`/users/${product.seller_name}`} className="hover:underline">{product.seller_name}</Link>
                </p>
              </div>

              <div className="border-b pb-4">
                {product.listing_type === 'auction' ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded">
                        AUCTION
                      </span>
                      {product.auction_end && new Date(product.auction_end) > new Date() ? (
                        <span className="text-xs text-green-600 font-medium">
                          ACTIVE
                        </span>
                      ) : (
                        <span className="text-xs text-red-600 font-medium">
                          ENDED
                        </span>
                      )}
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                      ฿{(product.current_bid || product.starting_price || 0).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {product.current_bid && product.current_bid > (product.starting_price || 0) ? 'Current highest bid' : 'Starting price'}
                    </p>
                    {product.starting_price && product.current_bid && product.current_bid > product.starting_price && (
                      <p className="text-sm text-gray-500">
                        Starting price: ฿{product.starting_price.toFixed(2)}
                      </p>
                    )}
                    {product.auction_end && (
                      <p className="text-sm text-gray-600">
                        Auction ends: {new Date(product.auction_end).toLocaleString()}
                      </p>
                    )}
                    {product.min_bid_step && (
                      <p className="text-sm text-gray-500">
                        Minimum bid step: ฿{product.min_bid_step.toFixed(2)}
                      </p>
                    )}
                  </div>
                ) : (
                  <>
                    <p className="text-3xl font-bold text-gray-900">฿{product.price.toFixed(2)}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                    </p>
                  </>
                )}
              </div>

              {product.category && (
                <div>
                  <span className="inline-block px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full">
                    {product.category}
                  </span>
                </div>
              )}

              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
                <p className="text-gray-600">{product.short_description}</p>
              </div>

              {canDelete && (
                <DeleteProductButton productId={product.id} />
              )}

              {product.listing_type === 'auction' ? (
                <>
                  {product.status === 'available' && 
                   product.auction_end && 
                   new Date(product.auction_end) > new Date() && 
                   currentUser?.userId !== product.seller_id && (
                    <BidButton product={product} />
                  )}
                  {product.auction_end && new Date(product.auction_end) <= new Date() && (
                    <div className="p-4 bg-gray-100 rounded-lg text-center">
                      <p className="text-gray-600 font-semibold">This auction has ended</p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {product.stock > 0 && product.status === 'available' && currentUser?.userId !== product.seller_id && (
                    <BuyButton product={product} />
                  )}
                  {product.status === 'sold' && (
                    <div className="p-4 bg-gray-100 rounded-lg text-center">
                      <p className="text-gray-600 font-semibold">This item has been sold</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Long Description Section */}
          <div className="border-t px-8 py-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Product Details</h2>
            <div className="prose max-w-none text-gray-600">
              <p className="whitespace-pre-wrap">{product.long_description}</p>
            </div>
          </div>

          {/* Bid History Section - Only for auctions */}
          {product.listing_type === 'auction' && (
            <div className="border-t px-8 py-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Bid History</h2>
              {bids.length > 0 ? (
                <div className="space-y-3">
                  {bids.map((bid, index) => (
                    <div key={bid.id} className={`flex justify-between items-center p-4 rounded-lg ${index === 0 ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                      <div>
                        <span className="font-semibold text-gray-900">
                          {bid.bidder_name}
                        </span>
                        {index === 0 && (
                          <span className="ml-2 text-xs bg-green-600 text-white px-2 py-1 rounded-full">
                            Highest Bid
                          </span>
                        )}
                        <p className="text-sm text-gray-500">
                          {new Date(bid.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-gray-900">
                          ฿{bid.amount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No bids have been placed yet.</p>
                  {product.starting_price && (
                    <p className="text-sm text-gray-400 mt-1">
                      Starting price: ฿{product.starting_price.toFixed(2)}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}