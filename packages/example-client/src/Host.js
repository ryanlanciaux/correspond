import React, { Component, Fragment } from "react";

import { Host as HostWrapper } from "correspond";
import { getRandomStuff } from "./utils";
import DataChannelSender from "./DataChannelSender";

const Host = props => (
  <HostWrapper {...props}>
    {({
      hasSocketConnection,
      hasDataChannel,
      sendMessage,
      accessCode,
      subscribe
    }) => {
      if (!hasSocketConnection) {
        return null;
      }

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
          <h1>{accessCode ? accessCode : "Loading"}</h1>
          <div style={{ marginTop: 30 }}>Version 0.10</div>
        </div>
      );
    }}
  </HostWrapper>
);

export default Host;
