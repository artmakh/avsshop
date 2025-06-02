import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/app/lib/auth';
import { deleteProduct, deleteProductAdmin, getProductById, getProductImages } from '@/app/lib/db';
import { unlink } from 'fs/promises';
import path from 'path';
import { Product, ProductImage } from '@/app/types';

interface UserData {
  id: number;
  username: string;
  password: string;
  is_admin: number;
  created_at: string;
  updated_at: string;
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
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

    // Get user data to check if admin
    const { getUserById } = await import('@/app/lib/db');
    const userData = getUserById.get(user.userId) as UserData;
    
    // Check if user owns the product or is admin
    if (product.seller_id !== user.userId && !userData?.is_admin) {
      return NextResponse.json(
        { error: 'You can only delete your own products' },
        { status: 403 }
      );
    }

    // Get all product images before deletion
    const images = getProductImages.all(productId) as ProductImage[];
    
    // Delete product (cascade will handle product_images table)
    if (userData?.is_admin) {
      deleteProductAdmin.run(productId);
    } else {
      deleteProduct.run(productId, user.userId);
    }

    // Delete image files from filesystem
    for (const image of images) {
      try {
        // Extract filename from URL path
        const filename = image.image_url.replace('/uploads/', '');
        const filepath = path.join(process.cwd(), 'data', 'uploads', filename);
        await unlink(filepath);
      } catch (error) {
        // Continue even if file deletion fails
        console.error('Failed to delete image file:', error);
      }
    }

    return NextResponse.json({
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}