# RPI Users API

Install and start mongodb:

```shell
brew install mongodb-community@5.0
brew services start mongodb-community@5.0
```

Install dependencies:

```shell
npm install
npm start
```

Run tests:

```shell
npm test
```

## API endpoints

### POST: /create

Creates a new user.

Example request body:

```json
{
  "username": "aUsername1",
  "email": "email1@example.com",
  "password": "password",
  "active": true
}
```

Example response:

```json
{
  "username": "aUsername1",
  "email": "email1@example.com",
  "password": "$2b$10$UHEJovcdUabwxUTh6cg9seK7c1LwNFHnNRNe7sZjVZxZRmvNXCdS.",
  "active": false,
  "_id": "6164b1e9b160788c2a6e5e4e",
  "createdAt": "2021-10-11T21:51:37.464Z",
  "updatedAt": "2021-10-11T21:51:37.464Z",
  "__v": 0
}
```

### GET: /all

Gets all the users.

Example response:

```json
[
  {
    "_id": "61649f942c709ff597473c8f",
    "username": "aUsername1",
    "email": "email1@example.com",
    "active": true,
    "createdAt": "2021-10-11T20:33:24.813Z",
    "updatedAt": "2021-10-11T20:33:24.813Z",
    "__v": 0
  },
  {
    "_id": "6164b1e9b160788c2a6e5e4e",
    "username": "aUsername",
    "email": "email2@example.com",
    "active": false,
    "createdAt": "2021-10-11T21:51:37.464Z",
    "updatedAt": "2021-10-11T21:51:37.464Z",
    "__v": 0
  }
]
```

### GET: /search?{query}

Gets users matching {query} params, in the format below:

```url
  /search?username=aUsername2&email=email2@example.com

  /search?active=false
```

### POST: /login

Logs user in and returns a api token

Example request body:

```json
{
  "username": "aUsername1",
  "password": "password"
}
```

Example response:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFVc2VybmFtZTEiLCJlbWFpbCI6ImVtYWlsMUBleGFtcGxlLmNvbSIsImlhdCI6MTYzMzk4OTc2Mn0.bZAZvbR2VFMJX1zBrud66t-ISygTAqhAcIVc3GB9ef0"
}
```

### DELETE: /delete/:id

Deletes user by id, and returns the deleted user.
To delete users a valid API token must be provided in the requast Authorization header, as below:

```shell
  Authorization: Bearer anExampleToken
```

### DELETE: /delete?{query}

Deletes user by {query} params, and returns the number of deleted users.

To delete users a valid API token must be provided in the requast Authorization header, asn in the example above.

For example:

```url
  /delete?active=false
```
