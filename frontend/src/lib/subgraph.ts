import axios from 'axios';
import { SUBGRAPH_URL } from './constants';

export const fetchAuctions = async () => {
    const query = `
    {
      auctions(orderBy: startBlock, orderDirection: desc) {
        id
        seller
        asset
        assetType
        tokenIdOrAmount
        publicStartPrice
        duration
        settled
        expired
        startBlock
        createdAtTimestamp
        transactionHash
      }
    }
    `;
    
    try {
        const response = await axios.post(SUBGRAPH_URL, { query });
        return response.data.data.auctions;
    } catch (error) {
        console.error("Error fetching auctions:", error);
        return [];
    }
};

export const fetchAuctionById = async (id: string) => {
    const query = `
    {
      auction(id: "${id}") {
        id
        seller
        asset
        assetType
        tokenIdOrAmount
        publicStartPrice
        duration
        settled
        expired
        startBlock
        createdAtTimestamp
        transactionHash
      }
    }
    `;
    
    try {
        const response = await axios.post(SUBGRAPH_URL, { query });
        return response.data.data.auction;
    } catch (error) {
        console.error("Error fetching auction by id:", error);
        return null;
    }
};

export const fetchBids = async () => {
    const query = `
    {
      bids(orderBy: timestamp, orderDirection: desc, first: 50) {
        id
        bidder
        timestamp
        transactionHash
        auction {
          id
          asset
          assetType
        }
      }
    }
    `;
    
    try {
        const response = await axios.post(SUBGRAPH_URL, { query });
        return response.data.data.bids;
    } catch (error) {
        console.error("Error fetching bids:", error);
        return [];
    }
};

export const fetchUserAuctions = async (sellerAddress: string) => {
    const query = `
    {
      auctions(where: { seller: "${sellerAddress.toLowerCase()}" }, orderBy: startBlock, orderDirection: desc) {
        id
        seller
        asset
        assetType
        tokenIdOrAmount
        publicStartPrice
        duration
        settled
        expired
        startBlock
        createdAtTimestamp
        transactionHash
      }
    }
    `;
    
    try {
        const response = await axios.post(SUBGRAPH_URL, { query });
        return response.data.data.auctions;
    } catch (error) {
        console.error("Error fetching user auctions:", error);
        return [];
    }
};
