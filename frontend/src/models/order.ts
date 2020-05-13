import BN from "bn.js";
import {DateTime} from "luxon";

import {Unbox} from "~src/heplers/util-types";
import {
  CrossTx,
  TradeRequest,
  TradeRequestStatus,
  TradeStatus
} from "~src/libs/api";
import {Address} from "~src/types";

export const ORDER_STATUS = {
  OPENED: "opened",
  CANCELED: "canceled",
  COMPLETED: "completed",
  FAILED: "failed"
} as const;
export type OrderStatusType = Unbox<typeof ORDER_STATUS>;

export class Order {
  tradeId: number;
  tokenId: string;
  quantity: number;
  perUnitPrice: number;
  status: OrderStatusType;
  updatedAt: string;

  constructor({
    tradeId,
    tokenId,
    quantity,
    perUnitPrice,
    status
  }: {
    tradeId: number;
    tokenId: string;
    quantity: number;
    perUnitPrice: number;
    status: OrderStatusType;
  }) {
    this.tradeId = tradeId;
    this.tokenId = tokenId;
    this.quantity = quantity;
    this.perUnitPrice = perUnitPrice;
    this.status = status;
  }

  getTotal(): number {
    return new BN(this.quantity).muln(this.perUnitPrice).toNumber();
  }

  static getStatus(tradeStatus: TradeStatus) {
    switch (tradeStatus) {
      case TradeStatus.TRADE_OPENED:
        return ORDER_STATUS.OPENED;
      case TradeStatus.TRADE_CANCELED:
        return ORDER_STATUS.CANCELED;
      case TradeStatus.TRADE_COMPLETED:
        return ORDER_STATUS.COMPLETED;
    }
  }
}

export class SellOrder extends Order {
  owner: Address;
  buyOffers: BuyOffer[];

  constructor({
    tradeId,
    tokenId,
    quantity,
    perUnitPrice,
    status,
    owner,
    buyOffers,
    updatedAt
  }: {
    tradeId: number;
    tokenId: string;
    quantity: number;
    perUnitPrice: number;
    status: OrderStatusType;
    owner: Address;
    buyOffers: BuyOffer[];
    updatedAt: string;
  }) {
    super({
      tradeId,
      tokenId,
      quantity,
      perUnitPrice,
      status
    });
    this.owner = owner;
    this.buyOffers = buyOffers;
    this.updatedAt = updatedAt;
  }

  static sortDateDesc = (sellOrders: SellOrder[]) => {
    return sellOrders.sort((a: SellOrder, b: SellOrder) => {
      const aTime = DateTime.fromISO(a.updatedAt).toSeconds();
      const bTime = DateTime.fromISO(b.updatedAt).toSeconds();
      return aTime < bTime ? 1 : -1;
    });
  };
}

export const OFFER_STATUS = {
  OPENED: "opened",
  CANCELED: "canceled",
  ONGOING: "ongoing",
  COMPLETED: "completed",
  FAILED: "failed"
} as const;
export type OfferStatusType = Unbox<typeof OFFER_STATUS>;

export class BuyOffer {
  offerer: Address;
  offerId: number;
  tradeId: number;
  quantity: number;
  perUnitPrice: number;
  updatedAt: string;
  crossTx: CrossTx;
  status: OfferStatusType;

  constructor({
    offerer,
    offerId,
    tradeId,
    quantity,
    perUnitPrice,
    status,
    crossTx,
    updatedAt
  }: {
    offerer: Address;
    offerId: number;
    tradeId: number;
    quantity: number;
    perUnitPrice: number;
    updatedAt: string;
    crossTx: CrossTx;
    status: OfferStatusType;
  }) {
    this.offerer = offerer;
    this.offerId = offerId;
    this.tradeId = tradeId;
    this.quantity = quantity;
    this.perUnitPrice = perUnitPrice;
    this.status = status;
    this.crossTx = crossTx;
    this.updatedAt = updatedAt;
  }

  static from(
    {
      from: offerer,
      id: offerId,
      tradeId,
      status,
      crossTx,
      updatedAt
    }: TradeRequest,
    quantity: number,
    perUnitPrice: number
  ) {
    return new BuyOffer({
      offerer,
      offerId,
      tradeId,
      quantity,
      perUnitPrice,
      status: BuyOffer.getStatus(status),
      crossTx,
      updatedAt
    });
  }

  static getStatus(tradeRequestStatus: TradeRequestStatus) {
    switch (tradeRequestStatus) {
      case TradeRequestStatus.REQUEST_OPENED:
        return OFFER_STATUS.OPENED;
      case TradeRequestStatus.REQUEST_CANCELED:
        return OFFER_STATUS.CANCELED;
      case TradeRequestStatus.REQUEST_ONGOING:
        return OFFER_STATUS.ONGOING;
      case TradeRequestStatus.REQUEST_COMPLETED:
        return OFFER_STATUS.COMPLETED;
      case TradeRequestStatus.REQUEST_FAILED:
        return OFFER_STATUS.FAILED;
    }
  }

  getTotal(): number {
    return new BN(this.quantity).muln(this.perUnitPrice).toNumber();
  }

  static sortDateDesc = (buyOffers: BuyOffer[]) => {
    return buyOffers.sort((a: BuyOffer, b: BuyOffer) => {
      const aTime = DateTime.fromISO(a.updatedAt).toSeconds();
      const bTime = DateTime.fromISO(b.updatedAt).toSeconds();
      return aTime < bTime ? 1 : -1;
    });
  };
}
