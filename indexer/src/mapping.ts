import { BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts"
import {
  EmelBid,
  AuctionCreated,
  AuctionSettled,
  AuctionExpired,
  DecryptionRequested,
  DecryptionFulfilled,
  BidRefunded,
  ProceedsClaimed
} from "../generated/EmelBid/EmelBid"
import { Auction, Bid } from "../generated/schema"

export function handleAuctionCreated(event: AuctionCreated): void {
  let entity = new Auction(event.params.auctionId.toHexString())
  entity.seller = event.params.seller
  entity.asset = event.params.asset
  entity.assetType = event.params.assetType
  entity.tokenIdOrAmount = event.params.tokenIdOrAmount
  entity.publicStartPrice = event.params.publicStartPrice
  entity.duration = event.params.duration
  entity.startBlock = event.params.startBlock
  entity.settled = false
  entity.proceedsClaimed = false
  entity.expired = false
  entity.createdAtBlock = event.block.number
  entity.createdAtTimestamp = event.block.timestamp
  entity.save()
}

export function handleDecryptionRequested(event: DecryptionRequested): void {
  let entity = new Bid(event.params.requestId.toString())
  entity.auction = event.params.auctionId.toHexString()
  entity.bidder = event.params.bidder
  entity.requestId = event.params.requestId
  entity.timestamp = event.block.timestamp
  entity.blockNumber = event.block.number
  entity.save()
}

export function handleDecryptionFulfilled(event: DecryptionFulfilled): void {
  let entity = Bid.load(event.params.requestId.toString())
  if (entity) {
    entity.isWinning = event.params.isWinning
    entity.save()
  }
}

export function handleAuctionSettled(event: AuctionSettled): void {
  let entity = Auction.load(event.params.auctionId.toHexString())
  if (entity) {
    entity.settled = true
    entity.winner = event.params.winner
    entity.save()
  }
}

export function handleAuctionExpired(event: AuctionExpired): void {
  let entity = Auction.load(event.params.auctionId.toHexString())
  if (entity) {
    entity.expired = true
    entity.save()
  }
}

export function handleBidRefunded(event: BidRefunded): void {
  // Handled if we need a Refund entity
}

export function handleProceedsClaimed(event: ProceedsClaimed): void {
  let entity = Auction.load(event.params.auctionId.toHexString())
  if (entity) {
    entity.proceedsClaimed = true
    entity.save()
  }
}
