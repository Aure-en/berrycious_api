# Berrycious API

* [View Live](https://berrycious.vercel.app)
* [View Front Repository](https://github.com/Aure-en/berrycious)

## Description
Berrycious is a Recipes Blog API made with Express and MongoDB that allows an user to share recipes. Readers might comment, and send private messages to the blogger.

## Features
- Authentification (with JWT and Passport) is used to restrict permissions to anyone who is not the blogger.
- Posts may be created / read / deleted / updated by the blogger.
- Comments may be created by any reader. They may be deleted by the blogger, who is also able to edit their own comments.
- Private messages and inquiries may be sent to the blogger by any reader.
- Posts can be sorted by date or alphabetical order (ascending or descending)
- Posts can be filtered depending on the ingredients it contains, or the type of recipe.
- Pagination for posts.


## Installation

### Requirements
* Node
* MongoDB database

### Installation
#### Get the repository
```
$ git clone git@github.com:Aure-en/berrycious_api.git
$ cd berrycious_api
$ npm install
```

#### Set up environment variables
Create a .env file in the root directory and set the following variables
```
MONGODB_URI=yourdb
JWT_SECRET=yourJWTsecret
```

#### Start
```
$ npm run start
```

## Technologies
* Node.js
* Express
* MongoDB
* View dependencies in [package.json](https://github.com/Aure-en/berrycious_api/blob/master/package.json)