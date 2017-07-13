# All in one backend

Backend for my home automation and monitoring.
Used by my app https://github.com/jakkra/OneAppToRuleThemAll and my Magic mirror.

## Getting Started

If you want to run this server yourself locally, here is what you need. Otherwise check out Deployment below.

### Prerequisities

This server can control your lights from outside of your home network. This is not officially supported yet by Philips (it's coming).
So since I'm using the unofficial Philips Hue Remote API, it requires some configuration.
For full description look at http://blog.paulshi.me/technical/2013/11/27/Philips-Hue-Remote-API-Explained.html

This is however not set up here, it's configured by either my app or by editing the users hueBridgeToken and hueBridgeId in a query.

- Node and npm: https://nodejs.org/en/download/package-manager/
- Mysql:
```
sudo apt-get install mysql-server
mysql -u root -p
create database reminders;
exit
```

### Installing

```
git clone https://github.com/jakkra/OneBackendToRuleThemAll.git
cd OneBackendToRuleThemAll
npm install
node
require('node-uuid').v4();
touch .env
```
Copy and paste the result into your .env ```SERVER_SECRET="yourServerSecret"```

Your .env file should look like this now:
```
SERVER_SECRET = "yourServerSecret"
```

Then to start the server run:
```
npm start
```

## Deployment

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/jakkra/OneBackendToRuleThemAll.git)

## Dokku Gmail
dokku storage:mount automation /var/lib/dokku/data/storage/automation:/app/storage

Add .credentials there.

## License

This project is licensed under the Apache License - see the [LICENSE](LICENSE) file for details
