# Welcome to the project reopsitory for Group 6
## Team members
- [Adam Faulkner](@faulknadam)
- [Vivienne Yapp](@yappvivi)
- [Conor Foran](@forancono)

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
Indexes: "users_pkey" PRIMARY KEY, btree (email)
Referenced by: TABLE "carts" CONSTRAINT "carts_email_fkey" FOREIGN KEY (email) REFERENCES users(email)

## Table "public.carts"

|Column|Type|Modifiers|Storage|Stats target|Description|
|:---:|:---:|:---:|:---:|:---:|:---:|
|cartid|integer|not null default nextval('carts_cartid_seq'::regclass)|plain|||
|email|character varying(255)|extended|||||
Indexes:  
"carts_pkey" PRIMARY KEY, btree (cartid)  
Foreign-key constraints:  
"carts_email_fkey" FOREIGN KEY (email) REFERENCES users(email)  
Referenced by:  
TABLE "incarts" CONSTRAINT "incarts_cartid_fkey" FOREIGN KEY (cartid) REFERENCES carts(cartid)

## Table "public.incarts"
|Column  |  Type   | Modifiers | Storage | Stats target | Description |
|:---:|:---:|:---:|:---:|:---:|:---:|
|cartid   | integer | not null  | plain   |              | |
|id       | integer | not null  | plain   |              | |
|quantity | integer |           | plain   |              | ||
Indexes:  
    "incarts_pkey" PRIMARY KEY, btree (cartid, id)  
Foreign-key constraints:  
    "incarts_cartid_fkey" FOREIGN KEY (cartid) REFERENCES carts(cartid)  
    "incarts_id_fkey" FOREIGN KEY (id) REFERENCES products(id)
