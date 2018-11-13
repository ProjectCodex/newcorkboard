# Corkboard development instructions!

**Step 1: If you're using VS Code, do the following:** 
* **PC:** Press ctrl + shift + v
* **MAC:** Press command + shift + v

That should've fired up the markdown preview mode so you can read this document with the styling applied instead of the raw markdown.

**NOTE:** This guide assumes you have Node and NPM installed.

**Step 2:** open your terminal in the project root directory and type `npm i`
* This will install both the node server and react client dependencies.

**Step 3:** create a `.env` file in the project root  

* This file contains the environmental variables necessary for the project to run. It should look like this:
```
GOOGLE_CLIENT_ID=biglongstring.somegoogleaddress.com
GOOGLE_CLIENT_SECRET=anotherbiglongstring123
COOKIE_NAME=someName
COOKIE_KEY_1=Word1
COOKIE_KEY_2=Word2
COOKIE_KEY_3=Word3
```
* Ping `Lee W` on the slack channel for the client ID/Secret. The other values listed can be any string you like.

**Step 4:** Make sure you have MySQL installed.
* I would recomment making your username and password `root` and `root` for your local installation.
* If your username or password is *not* `root/root`, you'll need to go to `config/config.json` and change the username/password options to match your credentials.

**Step 5:** Run `npx sequelize-cli db:create corkboard2` in your terminal in the project root directory
* This will create a MySQL database called `corkboard2` on your machine, which is necessary for development

**Step 6:** Run `npm start` in the project root
* This will kick off the development servers.
  * React will run on `http://localhost:3000`
  * The node server will run on `http://localhost:3001`
* The react client is preconfigured to proxy all api requests to port `3001`.

