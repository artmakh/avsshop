import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/app/lib/auth';
import { 
  getProductById, 
  createPurchase, 
  markProductAsSold, 
  createNotification 
} from '@/app/lib/db';
import { Product } from '@/app/types';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Please login to buy products' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const productId = parseInt(id);
    const { contactType, contactInfo } = await request.json();

    // Validate input
    if (!contactType || !contactInfo) {
      return NextResponse.json(
        { error: 'Contact information is required' },
        { status: 400 }
      );
    }

    // Get product
    const product = getProductById.get(productId) as Product;
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if product is available
    if (product.status !== 'available' || product.stock === 0) {
      return NextResponse.json(
        { error: 'Product is not available' },
        { status: 400 }
      );
    }

    // Check if user is trying to buy their own product
    if (product.seller_id === user.userId) {
      return NextResponse.json(
        { error: 'You cannot buy your own product' },
        { status: 400 }
      );
    }

    // Create purchase record
    createPurchase.run({
      product_id: productId,
      buyer_id: user.userId,
      buyer_contact: contactInfo,
      contact_type: contactType
    });

    // Mark product as sold
    markProductAsSold.run(user.userId, productId);

    // Create notification for seller
    const notificationData = JSON.stringify({
      productId,
      productName: product.name,
      buyerContact: contactInfo,
      contactType
    });

    createNotification.run({
      user_id: product.seller_id,
      type: 'purchase',
      message: `Your product "${product.name}" has been purchased! Buyer's ${contactType} contact: ${contactInfo}`,
      data: notificationData
    });

    return NextResponse.json({
      message: 'Purchase successful',
      success: true
    });
  } catch (error) {
    console.error('Buy product error:', error);
    return NextResponse.json(
      { error: 'Failed to complete purchase' },
      { status: 500 }
    );
  }
}