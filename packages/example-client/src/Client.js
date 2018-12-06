import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

import DataChannelSender from "./DataChannelSender";
import { getRandomStuff } from "./utils";
import { CLIENT } from "./constants";

import { Client as ClientWrapper } from "correspond";

class Client extends Component {
  handleKeyPress = e => {
    if (e.key === "Enter") {
      this.startEstablishingConnection();
    }
  };

  startEstablishingConnection = () => {
    this.props.establishConnectionWithKey(this.element.value);
  };

  render() {
    const { hasDataChannel, sendMessage, subscribe } = this.props;

    if (hasDataChannel) {
      return (
        <DataChannelSender
          onClick={() => sendMessage(getRandomStuff())}
          subscribe={subscribe}
        />
      );
    }

    return (
      <div style={{ margin: 100 }}>
        <input
          type="text"
          ref={el => (this.element = el)}
          onKeyPress={this.handleKeyPress}
          placeholder="Enter keycode"
        />
        <button onClick={this.startEstablishingConnection}>GO!</button>
      </div>
    );
  }
}

const ClientSync = props => (
  <ClientWrapper {...props}>
    {({
      hasDataChannel,
      sendMessage,
      subscribe,
      establishConnectionWithKey
    }) => (
      <Client
        hasDataChannel={hasDataChannel}
        sendMessage={sendMessage}
        subscribe={subscribe}
        establishConnectionWithKey={establishConnectionWithKey}
      />
    )}
  </ClientWrapper>
);

export default ClientSync;
