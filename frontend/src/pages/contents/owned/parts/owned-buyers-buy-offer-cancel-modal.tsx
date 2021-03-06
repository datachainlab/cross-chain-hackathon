import {Modal} from "antd";
import React from "react";

import {OwnedEstate} from "~models/estate";
import {BuyOffer} from "~models/order";

interface Props {
  estate: OwnedEstate;
  order: BuyOffer;
  onOK: () => void;
  onCancel: () => void;
  visible: boolean;
  confirmLoading: boolean;
}

export class OwnedBuyersBuyOfferCancelModal extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const {estate, order, onOK, onCancel, visible, confirmLoading} = this.props;

    return (
      <Modal
        title="CANCEL ORDER"
        centered
        visible={visible}
        confirmLoading={confirmLoading}
        onOk={onOK}
        onCancel={onCancel}
        okText={"CONFIRM"}
        cancelText={"CANCEL"}
      >
        <div>owner: {estate.name}</div>
        <div>tradeId: {order.tradeId}</div>
        <div>tokenId: {estate.tokenId}</div>
        <div>units: {estate.units}</div>
        <div>perUnit: {order.perUnitPrice}</div>
        <div>total: {order.getTotal()}</div>
      </Modal>
    );
  }
}
