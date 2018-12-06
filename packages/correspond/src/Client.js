import { Component } from "react";
import { CLIENT } from "./constants";

export class Client extends Component {
  establishConnectionWithKey = key => {
    const { sendSocketMessage } = this.props;

    sendSocketMessage({ type: CLIENT, code: key });
  };

  render() {
    const { hasDataChannel, sendDataChannelMessage, subscribe } = this.props;

    return this.props.children({
      hasDataChannel,
      sendMessage: sendDataChannelMessage,
      subscribe,
      establishConnectionWithKey: this.establishConnectionWithKey
    });
  }
}
