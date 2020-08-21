const express = require('express');
const router = express.Router();
const { StreamChat } = require('stream-chat');

const streamApiKey = process.env.STREAM_API_KEY;
const streamApiSecret = process.env.STREAM_API_SECRET;

const serverSideClient = new StreamChat(streamApiKey, streamApiSecret);

router.post('/customer-login', async (req, res) => {
  try {
    const firstName = req.body.firstName.replace(/\s/g, '_');
    const lastName = req.body.lastName.replace(/\s/g, '_');
    const username = `${firstName}${lastName}`.toLowerCase();

    const customerToken = serverSideClient.createToken(username);
    await serverSideClient.updateUser(
      {
        id: username,
        name: firstName
      },
      customerToken
    );

    const channel = serverSideClient.channel('messaging', username, {
      name: `Chat with ${username}`,
      created_by: { id: 'admin' },
      members: [username, 'admin']
    });

    await channel.create();
    await channel.addMembers([username, 'admin']);

    res.status(200).json({
      customerId: username,
      channelId: username,
      customerToken,
      streamApiKey,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/admin-login', async (req, res) => {
  try {
    const username = req.body.adminId.replace(/\s/g, '_').toLowerCase();
    const adminToken = serverSideClient.createToken(username);
    await serverSideClient.updateUser(
      {
        id: 'admin',
        name: 'admin'
      },
      adminToken
    );

    const channel = serverSideClient.channel('messaging', "livechat", {
      name: "Customer Support Dashboard",
      created_by: { id: 'admin' }
    });

    await channel.create();
    await channel.addMembers(['admin']);

    res.status(200).json({
      adminName: username,
      adminToken,
      streamApiKey,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
