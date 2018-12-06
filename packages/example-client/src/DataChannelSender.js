import React, { Fragment } from "react";
import { subscriberMessageTypes } from "correspond";

class DataChannelSender extends React.Component {
  state = { messages: [] };

  componentDidMount() {
    this.props.subscribe(this.handleMessages);
  }

  handleMessages = action => {
    switch (action.type) {
      case subscriberMessageTypes.ON_DATACHANNEL_MESSAGE: {
        this.state.messages.push(action.message.data);
        this.setState({ messages: this.state.messages });
        break;
      }
      default: {
        return null;
      }
    }
  };

  render() {
    const { onClick } = this.props;
    return (
      <Fragment>
        Click to send random stuff over data channel.
        <button onClick={onClick}>Click to send random stuff.</button>
        <h5>Latest received messages</h5>
        {this.state.messages.length > 0 && (
          <ul>
            {this.state.messages.map(message => (
              <li>{message}</li>
            ))}
          </ul>
        )}
      </Fragment>
    );
  }
}

export default DataChannelSender;
