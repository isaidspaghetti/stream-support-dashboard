import React, { useState } from 'react';
import { StreamChat } from 'stream-chat';
import 'stream-chat-react/dist/css/index.css';
import {
  Chat,
  Channel,
  ChannelHeader,
  Window,
  MessageList,
  ChannelList,
  MessageInput,
  ChannelPreviewMessenger,
  Thread
} from "stream-chat-react";

let chatClient;

function Admin() {
  document.title = "Admin";
  const [adminId, setAdminId] = useState('');
  const [channel, setChannel] = useState(null);

  const register = async (e) => {
    try {
      e.preventDefault();
      const response = await fetch('http://localhost:8080/admin-login', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminId,
        }),
      });

      const { adminToken, streamApiKey, adminName } = await response.json();
      chatClient = new StreamChat(streamApiKey);

      await chatClient.setUser(
        {
          id: adminName,
          name: 'Administrator'
        },
        adminToken,
      );

      const channel = chatClient.channel('messaging', 'livechat');

      await channel.watch();
      setChannel(channel);

    } catch (e) {
      console.error(e);
    }
  };

  if (channel) {
    return (
      <Chat client={chatClient} theme={"messaging light"}>
        <ChannelList
          sort={{ last_message_at: -1 }}
          Preview={ChannelPreviewMessenger}
          onSelect={(channel) => { setChannel(channel); }
          }
        />
        <Channel>
          <Window>
            <ChannelHeader />
            <MessageList />
            <MessageInput focus />
          </Window>
          <Thread />
        </Channel>
      </Chat >
    );

  } else {
    return (
      <div className="App container">
        <form className="card" onSubmit={register}>
          <label>Admin Id</label>
          <input
            type="text"
            value={adminId}
            onChange={(e) => setAdminId(e.target.value)}
            placeholder="Enter your admin ID"
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

export default Admin;
