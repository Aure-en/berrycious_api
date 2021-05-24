# Lettuce Eat API

[Lettuce Eat - View site](https://aure-en.github.io/lettuce_eat/)

## Description
Lettuce Eat is a Recipes Blog API that allows an user to share recipes. Readers might comment, and send messages to the blogger. It is a project realized as The Odin Project's [Blog API Project](https://www.theodinproject.com/paths/full-stack-javascript/courses/nodejs/lessons/blog-api).

## Features
- Authentification (with JWT and Passport) is used to restrict permissions to anyone who is not the blogger.
- Posts may be created / read / deleted / updated by the blogger.
- Comments may be created by any reader. They may be deleted by the blogger, who is also able to edit their own comments.
- Messages may be sent to the blogger by any reader.
- Posts can be sorted by date or alphabetical order (ascending or descending)
- Posts can be filtered depending on the ingredients it contains, or the type of recipe.
- Simple pagination for posts.
