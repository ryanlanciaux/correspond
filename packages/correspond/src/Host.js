import { Component } from "react";
import { HOST } from "./constants";

const MAX_ATTEMPTS = 5;
const RETRY_TIMEOUT = 200;

export class Host extends Component {
  state = { maxRetriesEncountered: false };
  static defaultProps = {
    maxAttempts: MAX_ATTEMPTS,
    retryTimeout: RETRY_TIMEOUT
  };

  componentDidMount() {
    this.attemptEstablishConnection();
  }

  attemptEstablishConnection = () => {
    const { maxAttempts, retryTimeout } = this.props;
    if (this.connectionAttempts > maxAttempts) {
      this.setState({ maxRetriesEncountered: true });
      return;
    }

    this.connectionAttempts++;

    window.setTimeout(() => {
      if (this.establishConnection()) {
        return;
      }

      this.attemptEstablishConnection();
    }, retryTimeout);
  };

  establishConnection = () => {
    const { sendSocketMessage, isSocketConnectionEstablished } = this.props;

    if (isSocketConnectionEstablished) {
      sendSocketMessage({ type: HOST });
      return true;
    }

    return false;
  };

  render() {
    const {
      hasDataChannel,
      sendDataChannelMessage,
      isSocketConnectionEstablished,
      accessCode,
      subscribe
    } = this.props;

    const { maxRetriesEncountered } = this.state;

    return this.props.children({
      hasSocketConnection: isSocketConnectionEstablished,
      hasDataChannel,
      sendMessage: sendDataChannelMessage,
      accessCode,
      subscribe,
      connectionError: maxRetriesEncountered
    });
  }
}
