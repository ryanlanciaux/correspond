import React, { Component } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { Correspondent } from "correspond";

import { BrowserRouter, Route, Link } from "react-router-dom";
import Host from "./Host";
import Client from "./Client";

const SOCKET_ADDRESS = "ws://127.0.0.1:8088";

const Router = () => (
  <BrowserRouter>
    <div>
      <Route
        exact
        path="/"
        render={props => (
          <div>
            <div
              style={{
                margin: 20,
                padding: 20,
                backgroundColor: "#EDEDED",
                borderRadius: 15
              }}
            >
              <Link to="/Host">HOST</Link>
            </div>
            <div
              style={{
                margin: 20,
                padding: 20,
                backgroundColor: "#EDEDED",
                borderRadius: 15
              }}
            >
              <Link to="/join">JOIN</Link>
            </div>
            <div style={{ margin: 20, padding: 20 }}>Version 0.11</div>
          </div>
        )}
      />
      <Route
        exact
        path="/host"
        render={props => (
          <Correspondent socketAddress={SOCKET_ADDRESS}>
            {connectionProps => <Host {...connectionProps} />}
          </Correspondent>
        )}
      />
      <Route
        exact
        path="/join"
        render={props => (
          <Correspondent socketAddress={SOCKET_ADDRESS}>
            {connectionProps => <Client {...connectionProps} />}
          </Correspondent>
        )}
      />
    </div>
  </BrowserRouter>
);

export default Router;
