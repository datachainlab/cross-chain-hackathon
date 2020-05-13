import {DividendHistory, IssuerDividend} from "~models/dividend";
import {User} from "~models/user";
import {Unbox} from "~src/heplers/util-types";
import {
  BuyOffer,
  OFFER_STATUS,
  ORDER_STATUS,
  SellOrder
} from "~src/models/order";
import {Address} from "~src/types";

export const ESTATE_STATUS = {
  OWNED: "owned",
  SELLING: "selling",
  BUYING: "buying"
} as const;
export type EstateStatusType = Unbox<typeof ESTATE_STATUS>;

export type EstateExtend = MarketEstate | OwnedEstate | IssuerEstate;

export class Estate {
  tokenId: string;
  name: string;
  imagePath: string;
  description: string;
  expectedYield: number;
  dividendDate: string;
  offerPrice: number;
  issuedBy: Address;

  units?: number;
  status?: EstateStatusType;

  constructor({
    tokenId,
    name,
    imagePath,
    description,
    expectedYield,
    dividendDate,
    offerPrice,
    issuedBy
  }: {
    tokenId: string;
    name: string;
    imagePath: string;
    description: string;
    expectedYield: number;
    dividendDate: string;
    offerPrice: number;
    issuedBy: Address;
  }) {
    this.tokenId = tokenId;
    this.name = name;
    this.imagePath = imagePath;
    this.description = description;
    this.expectedYield = expectedYield;
    this.dividendDate = dividendDate;
    this.offerPrice = offerPrice;
    this.issuedBy = issuedBy;
  }
}

export class OwnedEstate extends Estate {
  units: number;
  status: EstateStatusType;
  dividend: DividendHistory[];
  sellOrders: SellOrder[];

  constructor({
    tokenId,
    name,
    imagePath,
    description,
    expectedYield,
    dividendDate,
    offerPrice,
    issuedBy,
    units,
    status,
    dividend,
    sellOrders
  }: {
    tokenId: string;
    name: string;
    imagePath: string;
    description: string;
    expectedYield: number;
    dividendDate: string;
    offerPrice: number;
    issuedBy: Address;
    units: number;
    status: EstateStatusType;
    dividend: DividendHistory[];
    sellOrders: SellOrder[];
  }) {
    super({
      tokenId,
      name,
      imagePath,
      description,
      expectedYield,
      dividendDate,
      offerPrice,
      issuedBy
    });

    this.units = units;
    this.status = status;
    this.dividend = dividend;
    this.sellOrders = sellOrders;
  }

  static default = (): OwnedEstate => {
    return new OwnedEstate({
      tokenId: "",
      name: "",
      imagePath: "",
      description: "",
      expectedYield: 0,
      dividendDate: "",
      offerPrice: 0,
      issuedBy: "",
      units: 0,
      status: ESTATE_STATUS.OWNED,
      dividend: [],
      sellOrders: []
    });
  };

  static getStatus(sellOrders: SellOrder[], owner: Address): EstateStatusType {
    const openedOrder = sellOrders.find(
      order =>
        (order.owner === owner ||
          order.buyOffers.find(offer => offer.offerer === owner)) &&
        order.status === ORDER_STATUS.OPENED
    );

    if (!openedOrder) {
      return ESTATE_STATUS.OWNED;
    }

    if (
      openedOrder.buyOffers.find(
        offer =>
          (offer.status === OFFER_STATUS.ONGOING ||
            offer.status === OFFER_STATUS.OPENED) &&
          offer.offerer === owner
      )
    ) {
      return ESTATE_STATUS.BUYING;
    }

    return ESTATE_STATUS.SELLING;
  }

  findActiveSellOrder = (): SellOrder | null => {
    return (
      SellOrder.sortDateDesc(this.sellOrders).find(
        order => order.status === ORDER_STATUS.OPENED
      ) ?? null
    );
  };

  isActiveSellOrder = (): boolean => {
    return !!this.findActiveSellOrder();
  };

  findOwnedBuyOffer = (offerer: Address): BuyOffer[] => {
    const activeSellOrderBuyOffers = SellOrder.sortDateDesc(this.sellOrders)
      .filter(order => order.buyOffers.find(offer => offer.offerer === offerer))
      .map(order => order.buyOffers);

    const ret: BuyOffer[] = [];
    activeSellOrderBuyOffers.forEach(offers =>
      offers.forEach(offer => ret.push(offer))
    );

    return BuyOffer.sortDateDesc(ret);
  };
}

export class MarketEstate extends Estate {
  sellOrders: SellOrder[];

  constructor({
    tokenId,
    name,
    imagePath,
    description,
    expectedYield,
    dividendDate,
    offerPrice,
    issuedBy,
    sellOrders
  }: {
    tokenId: string;
    name: string;
    imagePath: string;
    description: string;
    expectedYield: number;
    dividendDate: string;
    offerPrice: number;
    issuedBy: Address;
    sellOrders: SellOrder[];
  }) {
    super({
      tokenId,
      name,
      imagePath,
      description,
      expectedYield,
      dividendDate,
      offerPrice,
      issuedBy
    });

    this.sellOrders = sellOrders;
  }

  static default = (): MarketEstate => {
    return new MarketEstate({
      tokenId: "",
      name: "",
      imagePath: "",
      description: "",
      expectedYield: 0,
      dividendDate: "",
      offerPrice: 0,
      issuedBy: "",
      sellOrders: []
    });
  };

  getUnOfferedSellOrders(user: User): SellOrder[] {
    return this.sellOrders.filter(
      order =>
        order.status === ORDER_STATUS.OPENED &&
        order.owner !== user.address &&
        !order.buyOffers.find(
          offer =>
            offer.offerer === user.address &&
            offer.status === OFFER_STATUS.OPENED
        )
    );
  }
}

export class IssuerEstate extends Estate {
  issuerDividend: IssuerDividend[];
  histories: DividendHistory[];

  constructor({
    tokenId,
    name,
    imagePath,
    description,
    expectedYield,
    dividendDate,
    offerPrice,
    issuedBy,
    issuerDividend,
    histories
  }: {
    tokenId: string;
    name: string;
    imagePath: string;
    description: string;
    expectedYield: number;
    dividendDate: string;
    offerPrice: number;
    issuedBy: Address;
    issuerDividend: IssuerDividend[];
    histories: DividendHistory[];
  }) {
    super({
      tokenId,
      name,
      imagePath,
      description,
      expectedYield,
      dividendDate,
      offerPrice,
      issuedBy
    });

    this.issuerDividend = issuerDividend;
    this.histories = histories;
  }

  static default = (): IssuerEstate => {
    return new IssuerEstate({
      tokenId: "",
      name: "",
      imagePath: "",
      description: "",
      expectedYield: 0,
      dividendDate: "",
      offerPrice: 0,
      issuedBy: "",
      issuerDividend: [],
      histories: []
    });
  };
}
