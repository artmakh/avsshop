import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/app/lib/auth';
import { createProduct, getAllProducts, addProductImage } from '@/app/lib/db';
import { writeFile } from 'fs/promises';
import path from 'path';
import fs from 'fs';

export async function GET() {
  try {
    const products = getAllProducts.all();
    return NextResponse.json({ products });
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { error: 'Failed to get products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please login to create products.' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    
    const name = formData.get('name') as string;
    const short_description = formData.get('short_description') as string;
    const long_description = formData.get('long_description') as string;
    const price = parseFloat(formData.get('price') as string);
    const stock = parseInt(formData.get('stock') as string);
    const category = formData.get('category') as string;
    const listing_type = formData.get('listing_type') as string || 'fixed';
    const starting_price = formData.get('starting_price') ? parseFloat(formData.get('starting_price') as string) : null;
    const auction_end = formData.get('auction_end') as string || null;
    const min_bid_step = formData.get('min_bid_step') ? parseFloat(formData.get('min_bid_step') as string) : null;

    if (!name || !short_description || !long_description) {
      return NextResponse.json(
        { error: 'Name, short description, and long description are required' },
        { status: 400 }
      );
    }

    // Validate based on listing type
    if (listing_type === 'fixed') {
      if (!price || !stock) {
        return NextResponse.json(
          { error: 'Price and stock are required for fixed price listings' },
          { status: 400 }
        );
      }
    } else if (listing_type === 'auction') {
      if (!starting_price || !auction_end) {
        return NextResponse.json(
          { error: 'Starting price and auction end time are required for auctions' },
          { status: 400 }
        );
      }
      
      // Validate auction end time is in the future
      const endTime = new Date(auction_end);
      if (endTime <= new Date()) {
        return NextResponse.json(
          { error: 'Auction end time must be in the future' },
          { status: 400 }
        );
      }

      // Validate min_bid_step
      if (min_bid_step && min_bid_step < 0.01) {
        return NextResponse.json(
          { error: 'Minimum bid step must be at least ฿0.01' },
          { status: 400 }
        );
      }
    }

    // Create product
    const result = createProduct.run({
      name,
      short_description,
      long_description,
      price: listing_type === 'fixed' ? price : 0,
      stock: listing_type === 'fixed' ? stock : 1,
      seller_id: user.userId,
      category,
      listing_type,
      starting_price,
      current_bid: listing_type === 'auction' ? starting_price : null,
      auction_end,
      min_bid_step: listing_type === 'auction' ? (min_bid_step || 0.01) : null
    });

    const productId = result.lastInsertRowid;

    // Handle image uploads
    const images = formData.getAll('images') as File[];
    for (let i = 0; i < images.length; i++) {
      const file = images[i];
      if (file && file.size > 0) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create unique filename
        const timestamp = Date.now();
        const filename = `${productId}-${timestamp}-${i}.${file.name.split('.').pop()}`;
        
        // Use data/uploads directory for persistence
        const uploadsDir = path.join(process.cwd(), 'data', 'uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        
        const filepath = path.join(uploadsDir, filename);
        await writeFile(filepath, buffer);
        
        // Save image reference in database
        addProductImage.run({
          product_id: productId,
          image_url: `/uploads/${filename}`,
          is_primary: i === 0 ? 1 : 0
        });
      }
    }

    return NextResponse.json({
      message: 'Product created successfully',
      productId
    });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}