### Building
```
npm run build
```

### Running

Get the Google credentials [here](https://console.developers.google.com/apis/credentials/oauthclient/730090819540-h8r35h0rger50psc5o2oiksafmnp7erc.apps.googleusercontent.com?project=busyimg-1582090529531).  

Get the database credentials from heroku:
```
heroku pg:credentials:url DATABASE
```

And set the config like so:

```
export GOOGLE_CLIENT_ID="..."
export GOOGLE_CLIENT_SECRET="..."
export NODE_ENV=development
heroku local
```
