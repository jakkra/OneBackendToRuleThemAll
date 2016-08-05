# All ine one backend

Backend for my home automation and monitoring.

## Getting Started

If you want to run this server yourself locally, here is what you need. Otherwise check out Deployment below.

### Prerequisities

This server can control your lights from outside of your home network. This is not officially supported yet by Philips (it's coming).
So since I'm using the unofficial Philips Hue Remote API, it requires some configuration.
For full description look at http://blog.paulshi.me/technical/2013/11/27/Philips-Hue-Remote-API-Explained.html
However my summarised steps should be enough.

- Node and npm: https://nodejs.org/en/download/package-manager/
- Mysql:
```
sudo apt-get install mysql-server
mysql -u root -p
create database reminders;
exit
```
- Create a file named .env
- Go to https://my.meethue.com/en-us/my-devices -> Login -> Settings -> MyBridge -> More Bridge Details
- Copy ID and paste it into .env like this: BRIDGE_ID="yourBridgeID"
- Go to ```www.meethue.com/en-US/api/gettoken?devicename=iPhone+5&appid=hueapp&deviceid=**BRIDGEID**``` and log in.
- Click 'yes' when it asks you if you trust the application
- Right click on the 'Back to app' button and select copy url/address or similar.
- It looks like this ```phhueapp://sdk/login/**ACCESSTOKEN**```
- Copy the accesstoken into .env file ```BRIDGE_ACCESS_TOKEN="yourAccessToken"```

### Installing

```
git clone https://github.com/jakkra/OneBackendToRuleThemAll.git
cd OneBackendToRuleThemAll
npm install
node
require('node-uuid').v4();
```
Copy and paste the result into your .env ```SERVER_SECRET="yourServerSecret"```

Your .env file should look like this now:
```
SERVER_SECRET = "yourServerSecret"
BRIDGE_ACCESS_TOKEN = "yourAccessToken"
BRIDGE_ID = "yourBridegID"
```

Then to start the server run:
```
npm start
```

## Deployment

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/jakkra/OneBackendToRuleThemAll.git)


## License

This project is licensed under the Apache License - see the [LICENSE](LICENSE) file for details
