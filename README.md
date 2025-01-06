## Getting Started
- Install NodeJS and NPM 
- Install dependencies `npm install`
- Install nodemon `npm install -g nodemon`
- Insatll Edge Tempalte Extension: https://marketplace.visualstudio.com/items?itemName=AdonisJS.vscode-edge

## Developing
It is recommended to use VS Code with the Dev Container extension to work on this project as the database is setup automaticaly with the dev container.

You can start the server with the following command (auto reload): `DEBUG=lan:* npm run watch`. 

### Environment
To ease the development you can add a ``.env`` file in the root of the repo with the following contents (you still need to fill in the blanks):
```bash
NODE_ENV=development

# src/web
WEB_PORT=3000
COOKIE_SECRET=amogus
PAYPAL_ACC=@your_account_here
PAYPAL_PREFIX=ULW1-

# srv/payment-service
PAYMENT_SERVICE_PORT=4000
IMAP_HOST=
IMAP_PORT=993
IMAP_SECURE=true
IMAP_USER=
IMAP_PASS=
IMAP_INBOX=Inbox
```

## Documentation
- EdgeJs: https://edgejs.dev/docs/introduction
- ExpressJs: https://expressjs.com/en/starter/installing.html

