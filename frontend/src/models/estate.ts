import {DividendHistory, DividendOwner} from "~models/dividend";
import {User} from "~models/user";
import {Unbox} from "~src/heplers/util-types";
import {BuyOffer, ORDER_STATUS, SellOrder} from "~src/models/order";
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
  owners?: DividendOwner[];

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
  dividendHistories: DividendHistory[];
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
    dividendHistories,
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
    dividendHistories: DividendHistory[];
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
    this.dividendHistories = dividendHistories;
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
      dividendHistories: [],
      sellOrders: []
    });
  };

  static getStatus(sellOrders: SellOrder[], owner: Address): EstateStatusType {
    const openedOrder = sellOrders.find(order => order.isOpened());

    if (!openedOrder) {
      return ESTATE_STATUS.OWNED;
    }

    if (openedOrder.isOffering(owner)) {
      return ESTATE_STATUS.BUYING;
    }

    if (openedOrder.isOwned(owner)) {
      return ESTATE_STATUS.SELLING;
    }

    return ESTATE_STATUS.OWNED;
  }

  sortSellOrdersByUpdateAtDesc() {
    return SellOrder.sortUpdateAtDesc(this.sellOrders);
  }

  findActiveSellOrder = (): SellOrder | null => {
    return (
      this.sortSellOrdersByUpdateAtDesc().find(
        order => order.status === ORDER_STATUS.OPENED
      ) ?? null
    );
  };

  filterAllOwnedSellOrdersBuyOffers = (owner: Address): BuyOffer[] => {
    const buyOffers = this.sortSellOrdersByUpdateAtDesc()
      .filter(order => order.isOwned(owner) && !order.isCancelled())
      .flatMap(order => order.buyOffers);

    return BuyOffer.sortDateDesc(buyOffers);
  };

  filterOwnedBuyOffers = (offerer: Address): BuyOffer[] => {
    const buyOffers = this.sortSellOrdersByUpdateAtDesc()
      .filter(order => !order.isCancelled())
      .flatMap(order => order.buyOffers)
      .filter(buyOffer => buyOffer.isOwned(offerer));

    return BuyOffer.sortDateDesc(buyOffers);
  };

  filterDistributedDividendHistories = (): DividendHistory[] => {
    return this.dividendHistories.filter(history => history.isDistributed());
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
      order => order.isOpened() && order.isUnOffered(user.address)
    );
  }
}

export class IssuerEstate extends Estate {
  owners: DividendOwner[];
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
    owners,
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
    owners: DividendOwner[];
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

    this.owners = owners;
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
      owners: [],
      histories: []
    });
  };

  isRegistering(): boolean {
    return !!this.histories.find(history => history.isRegistering());
  }
}
