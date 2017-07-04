# Welcome to the project reopsitory for Group 6
## Team members
- [Adam Faulkner](@faulknadam)
- [Vivienne Yapp](@yappvivi)
- [Conor Foran](@forancono)

# API
The application is divided across route modules each defining related functionality.
All routes use a middleware which passes along the custom headers in the request back to the response.
In this way the client is responsible for maintaining the session.

---
## `server.js`

The main file of our application, this defines the express application and starts the server listening.  

`GET -> /`
The server renders and sends the main page of the application.

---

## `routes/users.js`

User related functionality login/register etc.

`GET -> /login`  
Server sends a salt(number) as JSON for the client to append to it's passwords before hashing.  
eg.  
```
{
  salt: 987654321
}
```

`POST -> /login`  
Send the server a login attempt with email and hashed password in JSON.  
eg .
```
{
    email: "user@email.com",
    password: "210dd29b4ca6785b68f0ebf82a2b42ee823548d173ae8fb92fc8417c0c460a9b"
}
```

The server will attempt to find the user and if found and passwords match,  
will set the correct response headers and return a JSON object with the user
```
{
    user : {
        email: "user@email.com",
        password: "210dd29b4ca6785b68f0ebf82a2b42ee823548d173ae8fb92fc8417c0c460a9b",
        name: "Helen Clark"
        role: "Admin"
    }
}
```
If user is not found server responds with status 422 Unprocessable Entity.  
If passwords do not match the server responds with status 403 Forbidden.


`POST -> /login/google`  
User has received an access code which is to be exchanged for tokens with google.
Using these tokens then make a request to the google+ api for creepy details of the user.  
Taking these details a user account is made if it does not exist and the user is logged in.  
In the initial request:  
```
{
    code: ca6785b68f0ebf82a2b42ee823548d173ae8fb92fc8417c0c
}
```
The server will set the response headers to the logged in user.
In the case that a user was created the response status is 201 else it's 200.  
Otherwise in both cases the user object is returned the same as a regular login.

`GET -> /users/all`  
The server sends the users table as an array of user objects.

`DELETE -> /users/row`  
An email is sent to the server for removal from the table.  
```
{
    email: example@email.com
}
```
A database error with status 500 or for a success status 200

`PUT -> /users/row`  
Update a users details with the new name and role given along with the the users current email.  
```
{
    email: example.com,
    name: John Doe,
}

---
`GET -> /admin`  
If the user is admin render the admin dashboard HTML,
Else redirect to homepage

---
`POST -> /register`  
Send the server a new user to add to users in JSON.
eg.  
```
{
  name: "Helen Clark",
  email: "user@email.com",
  password: "210dd29b4ca6785b68f0ebf82a2b42ee823548d173ae8fb92fc8417c0c460a9b"
}
```

If the request is well formed the server will respond with a JSON user object the same as a successful post request to /login.
If the username is already taken the server will respond with status 409 Conflict.

---
`GET -> /logout`  
Will return an undefined user

## Carts
All shopping cart functionality uses session to link users to their carts.  
Session object must contain cartid.

---  
`GET -> /carts`  
Get all items currently in your cart. Returns an array of product objects.
```
[
  {
    name:
    description:
    price:
    new:
    sale:
    category:
    imagepath:
    id:
  },
  {
    name:
    description:
    price:
    new:
    sale:
    category:
    imagepath:
    id:
  },
]
```

---
`PUT -> /carts`  
Add an item to your cart. Request should be a JSON request of a product id.
```
{
  id: 1
}
```
The server respond with the new total number of items in the cart.
```
{
  totalcart: 1
}
```
If the product does not exist the server will respond with status 500 server error.

---
`POST -> /carts`  
Request the server to make a new shopping cart. No data payload needs to be sent.  
The server with respond with the id number of the cart.
```
{
  cartid: 42
}
```

---
`DELETE -> /carts`   
Request the server to remove an item from your cart.  Request must include the product id and how many removed.
```
{
  id: 32,
  numItems: 1
}
```
The server will respond with the user and list of products deleted.
```
{
  user: {

  },
  products: [{
    id: ,

  }],
  totalcart: 1
}
```

## Collections

---
`GET -> /collections`  
Return all items in products.  
A query can be added to perform a case insensitve search of products.  
eg. `GET -> /collections?search="searchPattern"`  
For a successful search (results found) the products are returned as a JSON array.
```
[
    {
        name: "",
        description: "",
        ...
    }, ...
]
```
In the case of a search with no results the server sends status 204 No Content

---
`GET -> /collections/:category="category"`
Return all products within a given category.

# Databse table schemas

## Table "public.products"

|Column|Type|Modifiers|Storage| Statstarget|Description|
|:---:|:---:|:---:|:---:|:---:|:---:|
|name| character varying(255)  | | extended | ||                        
|description | character varying(1024) |                                                       | extended | | |      
|price       | numeric                 |                                                       | main     | | |
|new         | boolean                 |                                                       | plain    | | |
|sale        | boolean                 |                                                       | plain    | | |
|stock       | integer                 |                                                       | plain    | | |
|category    | character varying(255)  |                                                       | extended | | |
|imagepath   | character varying(255)  |                                                       | extended | | |
|id          | integer                 | not null default nextval('products_id_seq'::regclass) | plain    | | ||

## Table "public.users"
|Column|Type|Modifiers|Storage|Stats target|Description|
|:---:|:---:|:---:|:---:|:---:|:---:|  
|email|character varying(255)|not null|extended|||
|password|character varying(511)||extended|||
|name|character varying(255)||extended||||
|role|character varying(24)||||
Indexes:  
"users_pkey" PRIMARY KEY, btree (email)  
Referenced by:  
TABLE "carts" CONSTRAINT "carts_email_fkey" FOREIGN KEY (email) REFERENCES users(email)

## Table "public.carts"
|Column|Type|Modifiers|Storage|Stats target|Description|
|:---:|:---:|:---:|:---:|:---:|:---:|
|cartid|integer|not null default nextval('carts_cartid_seq'::regclass)|plain|||
|email|character varying(255)|extended|||||
|sold|boolean|||||
|date_added|timestamp||||
Indexes:  
"carts_pkey" PRIMARY KEY, btree (cartid)  
 Referenced by:  
TABLE "incarts" CONSTRAINT "incarts_cartid_fkey" FOREIGN KEY (cartid) REFERENCES carts(cartid)

## Table "public.incarts"
|Column  |  Type   | Modifiers | Storage | Stats target | Description |
|:---:|:---:|:---:|:---:|:---:|:---:|
|cartid   | integer | not null  | plain   |              | |
|id       | integer | not null  | plain   |              | |
|quantity | integer |           | plain   |              | ||
|date_added|timestamp||||
Indexes:  
    "incarts_pkey" PRIMARY KEY, btree (cartid, id)  
Foreign-key constraints:  
    "incarts_cartid_fkey" FOREIGN KEY (cartid) REFERENCES carts(cartid)  
    "incarts_id_fkey" FOREIGN KEY (id) REFERENCES products(id)
