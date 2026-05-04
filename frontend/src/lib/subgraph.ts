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
