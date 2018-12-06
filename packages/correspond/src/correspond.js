import { Component } from "react";
import cuid from "cuid";

import { error } from "util";
require("webrtc-adapter");

const messagesTypes = {
  CANDIDATE: "CANDIDATE",
  OFFER: "OFFER",
  ANSWER: "ANSWER",
  HOST_KEY: "HOST_KEY",
  HOST_CONNECTION_INFO: "HOST_CONNECTION_INFO"
};

export const subscriberMessageTypes = {
  ON_DATACHANNEL_OPEN: "ON_DATACHANNEL_OPEN",
  ON_DATACHANNEL_CLOSE: "ON_DATACHANNEL_CLOSE",
  ON_DATACHANNEL_ERROR: "ON_DATACHANNEL_ERROR",
  ON_PEER_DATACHANNEL_OPEN: "ON_PEER_DATACHANNEL_OPEN",
  ON_DATACHANNEL_MESSAGE: "ON_DATACHANNEL_MESSAGE"
};

const rtcConfig = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

function addSubscriberToObject(subscriber, subscriberObject) {
  const id = cuid();
  return { ...subscriberObject, [id]: subscriber };
}

export class Correspondent extends Component {
  state = {
    isSocketConnectionEstablished: false,
    accessCode: null,
    hasDataChannel: false,
    latestMessage: null
  };

  constructor(props) {
    super();

    // name provided by server
    this.name = null;
    this.webSocket = null;
    this.remoteName = null;
    this.rtcConnection = {};
    this.dataChannel = null;
    this.peer = null;

    this.onIceCandidate = this.onIceCandidate.bind(this);
    this.sendMessage = this.sendMessage.bind(this);

    let subscribers = {};

    if (props.subscribers) {
      props.subscribers.forEach(subscriber => {
        addSubscriberToObject(subscriber, subscribers);
      });
    }

    this.subscribers = subscribers;
  }

  addSubscriber = subscriber => {
    this.subscribers = addSubscriberToObject(subscriber, {});
  };

  removeSubscriber = id => {
    delete this.subscribers[id];
  };

  sendMessageToSubscribers = (type, message) => {
    Object.keys(this.subscribers).forEach(key => {
      this.subscribers[key]({ type, message });
    });
  };

  componentDidMount() {
    const socket = new WebSocket(this.props.socketAddress);

    socket.onopen = () => {
      this.setState({ isSocketConnectionEstablished: true });
      this.webSocket = socket;

      socket.onmessage = this.onSocketMessage;
      socket.onclose = this.onSocketClose;
      socket.onerror = this.onSocketError;
    };

    this.peer = new (window.RTCPeerConnection ||
      window.msRTCPeerConnection ||
      window.mozRTCPeerConnection ||
      window.webkitRTCPeerConnection)(rtcConfig, this.rtcConnection);

    this.peer.onicecandidate = this.onIceCandidate;

    this.dataChannel = this.peer.createDataChannel("datachannel", {
      reliable: false
    });

    this.dataChannel.onopen = this.onDataChannelOpen;
    this.dataChannel.onerror = this.onDataChannelError;
    this.dataChannel.onclose = this.onDataChannelClose;

    this.peer.ondatachannel = this.onPeerDataChannel;
  }

  componentWillUnmount() {
    this.webSocket.close();
  }

  onDataChannelOpen = () => {
    this.sendMessageToSubscribers(subscriberMessageTypes.ON_DATACHANNEL_OPEN);
  };

  onDataChannelClose = () => {
    this.sendMessageToSubscribers(subscriberMessageTypes.ON_DATACHANNEL_CLOSE);
  };

  onDataChannelError = () => {
    this.sendMessageToSubscribers(subscriberMessageTypes.ON_DATACHANNEL_ERROR);
  };

  onPeerDataChannel = channelEvent => {
    channelEvent.channel.onopen = () => {
      this.sendMessageToSubscribers(
        subscriberMessageTypes.ON_PEER_DATACHANNEL_OPEN
      );
    };

    channelEvent.channel.onmessage = this.onChannelMessage;
    this.setState({ hasDataChannel: true });
  };

  onChannelMessage = message => {
    this.sendMessageToSubscribers(
      subscriberMessageTypes.ON_DATACHANNEL_MESSAGE,
      message
    );
  };

  onIceCandidate(e) {
    const candidate = e.candidate;
    this.sendNegotiation(messagesTypes.CANDIDATE, candidate);
  }

  onSocketClose = () => {
    this.props.onSocketClose && this.props.onSocketClose();
  };

  onSocketError = () => {
    this.props.onSocketError && this.props.onSocketError();
  };

  establishConnection = async () => {
    const constraints = {
      OfferToReceiveAudio: false,
      OfferToReceiveVideo: false
    };

    try {
      const params = await this.peer.createOffer(constraints);
      this.peer.setLocalDescription(params);
      this.sendNegotiation(messagesTypes.OFFER, params);
    } catch (ex) {
      console.error("Could not establish connection");
    }
  };

  onSocketMessage = async messageEvent => {
    var message = JSON.parse(messageEvent.data);

    if (!message.type && !message.clientName) {
      throw new Error("Not an expected message");
    }

    if (message.clientName) {
      this.name = message.clientName;
      return;
    }

    // This is a bit more stateful / mutatey than I would like as an end result
    // TODO: refactorrrrrrr
    if (message.from && !this.remoteName) {
      this.remoteName = message.from;
    }

    switch (message.type) {
      case messagesTypes.CANDIDATE:
        this.processIce(message.data);
        return;
      case messagesTypes.OFFER:
        this.processOffer(message.data);
        return;
      case messagesTypes.ANSWER:
        this.processAnswer(message.data);
        return;
      case messagesTypes.HOST_KEY:
        this.displayHostKey(message.accessCode);
        return;
      case messagesTypes.HOST_CONNECTION_INFO:
        this.remoteName = message.host;
        this.establishConnection();
        return;
      default:
        throw new error("Unknown message type");
    }
  };

  displayHostKey = accessCode => {
    this.setState({ accessCode });
  };

  processIce = async candidate => {
    try {
      this.peer.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (ex) {
      console.error("Error processing ice candidate");
    }
  };

  processOffer = async offer => {
    try {
      this.peer.setRemoteDescription(new RTCSessionDescription(offer));
      const constraints = {
        mandatory: {
          OfferToReceiveAudio: false,
          OfferToReceiveVideo: false
        }
      };

      const sessionDescriptionParameters = await this.peer.createAnswer(
        constraints
      );
      await this.peer.setLocalDescription(sessionDescriptionParameters);
      this.sendNegotiation(messagesTypes.ANSWER, sessionDescriptionParameters);
    } catch {
      console.error("Error in process offer");
    }
  };

  processAnswer = async answer => {
    this.peer.setRemoteDescription(new RTCSessionDescription(answer));
  };

  sendNegotiation = (type, sessionDescriptionParameters) => {
    this.sendMessage({
      from: this.name,
      to: this.remoteName,
      action: type,
      data: sessionDescriptionParameters
    });
  };

  sendMessage(message) {
    if (typeof message !== "object") {
      throw new error("Must send an object from sendMessage!");
    }

    this.webSocket.send(JSON.stringify({ ...message, socketName: this.name }));
  }

  sendChannelMessage = message => {
    this.dataChannel.send(message);
  };

  render() {
    const { children } = this.props;
    const {
      isSocketConnectionEstablished,
      accessCode,
      hasDataChannel,
      latestMessage
    } = this.state;

    return children({
      isSocketConnectionEstablished,
      sendSocketMessage: this.sendMessage,
      sendDataChannelMessage: this.sendChannelMessage,
      accessCode: accessCode,
      hasDataChannel: hasDataChannel,
      latestMessage,
      subscribe: this.addSubscriber,
      removeSubscriber: this.removeSubscriber
    });
  }
}
