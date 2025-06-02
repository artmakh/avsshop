import { 
  getEndedAuctions, 
  getHighestBid, 
  markAuctionAsSold, 
  createNotification, 
  createPurchase 
} from './db';
import { Product, Bid } from '@/app/types';

export async function processEndedAuctions() {
  try {
    const endedAuctions = getEndedAuctions.all() as Product[];
    
    for (const auction of endedAuctions) {
      // Get the highest bid for this auction
      const highestBid = getHighestBid.get(auction.id) as Bid;
      
      if (highestBid) {
        // There is a winner - assign the item to the highest bidder
        markAuctionAsSold.run(highestBid.bidder_id, auction.id);
        
        // Create a purchase record for tracking
        createPurchase.run({
          product_id: auction.id,
          buyer_id: highestBid.bidder_id,
          buyer_contact: 'auction_winner', // This could be enhanced to get actual contact
          contact_type: 'auction'
        });
        
        // Notify the winner
        createNotification.run({
          user_id: highestBid.bidder_id,
          type: 'auction_won',
          message: `Congratulations! You won the auction for "${auction.name}" with a bid of ฿${highestBid.amount.toFixed(2)}`,
          data: JSON.stringify({
            productId: auction.id,
            productName: auction.name,
            winningBid: highestBid.amount,
            sellerId: auction.seller_id
          })
        });
        
        // Notify the seller
        createNotification.run({
          user_id: auction.seller_id,
          type: 'auction_ended',
          message: `Your auction for "${auction.name}" has ended. Winner: ${highestBid.bidder_name} with ฿${highestBid.amount.toFixed(2)}`,
          data: JSON.stringify({
            productId: auction.id,
            productName: auction.name,
            winningBid: highestBid.amount,
            winnerId: highestBid.bidder_id,
            winnerName: highestBid.bidder_name
          })
        });
        
        console.log(`Auction ${auction.id} (${auction.name}) won by ${highestBid.bidder_name} for ฿${highestBid.amount}`);
      } else {
        // No bids were placed - just mark as ended but keep available for potential relisting
        console.log(`Auction ${auction.id} (${auction.name}) ended with no bids`);
        
        // Notify the seller that auction ended with no bids
        createNotification.run({
          user_id: auction.seller_id,
          type: 'auction_no_bids',
          message: `Your auction for "${auction.name}" has ended with no bids`,
          data: JSON.stringify({
            productId: auction.id,
            productName: auction.name
          })
        });
      }
    }
    
    return {
      processed: endedAuctions.length,
      auctions: endedAuctions.map(a => ({
        id: a.id,
        name: a.name,
        hasWinner: !!getHighestBid.get(a.id)
      }))
    };
  } catch (error) {
    console.error('Error processing ended auctions:', error);
    throw error;
  }
}