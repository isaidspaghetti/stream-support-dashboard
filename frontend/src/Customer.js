import React, { useState } from 'react';
import { StreamChat } from 'stream-chat';
import 'stream-chat-react/dist/css/index.css';
import {
  Chat,
  Channel,
  Window,
  TypingIndicator,
  MessageList,
  MessageCommerce,
  MessageInput,
  MessageInputFlat,
  withChannelContext
} from "stream-chat-react";

let chatClient;

function Customer() {
  document.title = "Customer";
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const [channel, setChannel] = useState(null);

  const register = async (e) => {
    try {
      e.preventDefault();

      const response = await fetch('http://localhost:8080/customer-login', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
        }),
      });

      const { customerId, customerToken, channelId, streamApiKey } = await response.json();
      chatClient = new StreamChat(streamApiKey);

      await chatClient.setUser(
        {
          id: customerId,
          name: firstName,
        },
        customerToken,
      );

      const channel = chatClient.channel('messaging', channelId, {
        name: `Chat with ${customerId}`
      });

      await channel.watch;
      setChannel(channel);

    } catch (e) {
      console.error(e, e.error);
    }
  };

  if (channel) {
    return (
      <Chat client={chatClient} theme="commerce light">
        <Channel channel={channel}>
          <Window>
            <div className="stream-header">
              <div className="str-header-left">
                <p className="stream-header-left-title">
                  Customer Support Chat
                </p>
              </div>
              <div className="str-chat__header-livestream-right">
                Welcome, {chatClient.user.name}
              </div>
            </div>
            <MessageList
              typingIndicator={TypingIndicator}
              Message={MessageCommerce}
            />
            <MessageInput Input={MessageInputFlat} focus />
          </Window>
        </Channel>
      </Chat>
    );

  } else {
    return (
      <div className="App container">
        <form className="card" onSubmit={register}>
          <label>First Name</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="first name"
            required
          />
          <label>Last Name</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="last name"
            required
          />
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email"
            required
          />
          <button type="submit">
            Start chat
          </button>
        </form>
      </div>
    );
  }
}

export default Customer;
