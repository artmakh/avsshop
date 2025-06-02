import { NextResponse } from 'next/server';
import { processEndedAuctions } from '@/app/lib/auction-processor';
import { getUser } from '@/app/lib/auth';
import { getUserById } from '@/app/lib/db';

interface UserData {
  id: number;
  username: string;
  password: string;
  is_admin: number;
  created_at: string;
  updated_at: string;
}

interface ProductData {
  id: number;
  name: string;
  auction_end: string;
}

export async function POST() {
  try {
    // Only allow admins to manually trigger auction processing
    const user = await getUser();
    if (user) {
      const userData = getUserById.get(user.userId) as UserData;
      if (!userData?.is_admin) {
        return NextResponse.json(
          { error: 'Unauthorized. Admin access required.' },
          { status: 403 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Unauthorized. Please login.' },
        { status: 401 }
      );
    }

    const result = await processEndedAuctions();
    
    return NextResponse.json({
      message: 'Auction processing completed',
      ...result
    });
  } catch (error) {
    console.error('Process auctions error:', error);
    return NextResponse.json(
      { error: 'Failed to process auctions' },
      { status: 500 }
    );
  }
}

// Allow GET for health checks or status
export async function GET() {
  try {
    const user = await getUser();
    if (user) {
      const userData = getUserById.get(user.userId) as UserData;
      if (!userData?.is_admin) {
        return NextResponse.json(
          { error: 'Unauthorized. Admin access required.' },
          { status: 403 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Unauthorized. Please login.' },
        { status: 401 }
      );
    }

    // Just check how many ended auctions need processing
    const { getEndedAuctions } = await import('@/app/lib/db');
    const endedAuctions = getEndedAuctions.all() as ProductData[];
    
    return NextResponse.json({
      endedAuctionsCount: endedAuctions.length,
      endedAuctions: endedAuctions.map(a => ({
        id: a.id,
        name: a.name,
        auction_end: a.auction_end
      }))
    });
  } catch (error) {
    console.error('Get auction status error:', error);
    return NextResponse.json(
      { error: 'Failed to get auction status' },
      { status: 500 }
    );
  }
}