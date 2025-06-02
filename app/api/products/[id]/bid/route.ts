import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/app/lib/auth';
import { getProductById, createBid, updateProductCurrentBid, createNotification } from '@/app/lib/db';
import { Product } from '@/app/types';

export async function POST(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please login to place bids.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const productId = parseInt(id);
    const product = getProductById.get(productId) as Product;

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if it's an auction
    if (product.listing_type !== 'auction') {
      return NextResponse.json(
        { error: 'This is not an auction item' },
        { status: 400 }
      );
    }

    // Check if auction is still active
    if (!product.auction_end || new Date(product.auction_end) <= new Date()) {
      return NextResponse.json(
        { error: 'This auction has ended' },
        { status: 400 }
      );
    }

    // Check if user is not the seller
    if (product.seller_id === user.userId) {
      return NextResponse.json(
        { error: 'You cannot bid on your own auction' },
        { status: 400 }
      );
    }

    // Check if product is available
    if (product.status !== 'available') {
      return NextResponse.json(
        { error: 'This auction is no longer available' },
        { status: 400 }
      );
    }

    const { amount } = await request.json();

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Valid bid amount is required' },
        { status: 400 }
      );
    }

    // Check if bid is higher than current bid by the minimum step
    const currentBid = product.current_bid || product.starting_price || 0;
    const bidStep = product.min_bid_step || 0.01;
    const minBid = currentBid + bidStep;
    
    if (amount < minBid) {
      return NextResponse.json(
        { error: `Bid must be at least ฿${minBid.toFixed(2)} (minimum step: ฿${bidStep.toFixed(2)})` },
        { status: 400 }
      );
    }

    // Create the bid
    const bidResult = createBid.run({
      product_id: productId,
      bidder_id: user.userId,
      amount
    });

    // Update product's current bid
    updateProductCurrentBid.run(amount, productId);

    // Create notification for the seller
    createNotification.run({
      user_id: product.seller_id,
      type: 'new_bid',
      message: `New bid of ฿${amount.toFixed(2)} placed on your auction "${product.name}"`,
      data: JSON.stringify({
        productId,
        bidAmount: amount,
        productName: product.name
      })
    });

    return NextResponse.json({
      message: 'Bid placed successfully',
      bidId: bidResult.lastInsertRowid,
      amount
    });
  } catch (error) {
    console.error('Place bid error:', error);
    return NextResponse.json(
      { error: 'Failed to place bid' },
      { status: 500 }
    );
  }
}