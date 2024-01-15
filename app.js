    const express = require('express');
    const WebSocket = require('ws');
    const http = require('http');
    const { Sequelize, DataTypes, Model } = require('sequelize');
    const fs = require('fs');

    // Check if the SQLite database file exists and is a valid SQLite database
    let storage;
    try {
      fs.accessSync('./database.sqlite', fs.constants.F_OK | fs.constants.W_OK);
      const fileBuffer = fs.readFileSync('./database.sqlite');
      if (fileBuffer && fileBuffer.toString('utf8', 0, 16) === 'SQLite format 3\0') {
        storage = './database.sqlite';
      } else {
        throw new Error('Invalid SQLite database');
      }
    } catch (e) {
      // If the SQLite database file does not exist or is not a valid SQLite database, create a new one
      storage = ':memory:';
      console.log('Creating a new SQLite database...');
    }

    const sequelize = new Sequelize({
      dialect: 'sqlite',
      storage
    });

    const app = express();
    const server = http.createServer(app);
    const wss = new WebSocket.Server({ server });

    app.use(express.static('public'));

    class Message extends Model {}

    Message.init({
      content: {
        type: DataTypes.TEXT,
        allowNull: false
      }
    }, {
      sequelize,
      modelName: 'Message'
    });

    sequelize.sync();

    wss.on('connection', ws => {
      ws.on('message', message => {
        Message.create({ content: message });
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(message);
          }
        });
      });
    });

    server.listen(3000, () => {
      console.log('Chat app server is listening on port 3000');
    });
    