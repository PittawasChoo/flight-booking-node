# Flight booking application backend with Nodejs + Express.js
Secure flight search and booking system project for applying to full stack developer at 30 Secondstofly.

## Pre-requisites
- Install [Node.js](https://nodejs.org/en/)

# Getting started
- Clone the repository
```
git clone https://github.com/PittawasChoo/flight-booking-node.git
```
- Create **.env** file in the same level as README.md, package.json, and other. After create .env file, add code below into it and replace the {...} with real data. In production or in other environment, .env can be set with other secret keys but we will use these generated keys for now.
```
# Environment variables.
PORT={Port number, default is 3001}

#DB CONFIG
DB_USER=postgres
DB_PASSWORD={Your PostgreSQL password from step 1.2.3. in instruction document}
DB_HOST=localhost
DB_PORT={Your database port from step 1.2.4. in instruction document}
DATABASE_NAME=postgres

#Secret keys
JWT_ENCRYPTION_KEY=ba81e9b03098af73ebf7787d099d101ff62c8f677a38bb43b4ca7f9dd8304ee1
CONTACT_ENCRYPTION_KEY=5b4e3d2c1a0e9f8c7b6d5a4e3f2c1b0a
PASSENGER_ENCRYPTION_KEY=1e2d3c4b5a6f7c8d9e0a1b2c3d4e5f6a
PAYMENT_ENCRYPTION_KEY=9f8e7d6c5b4a3c2d1e0f9a8b7c6d5e4f
```
- Install dependencies
```
cd flight-booking-node
npm install
```
- Run the project
```
npm start
```

## Project Structure
The folder structure of this app is explained below:

| Name | Description |
| ------------------------ | --------------------------------------------------------------------------------------------- |
| **node_modules** | Contains all npm dependencies. |
| **src** | Contains source code that will be compiled. |
| **src/config** | Map config from .env file and share across the application. |
| **src/controllers**| Controllers define functions to serve various express routes. |
| **src/middlewares** | Express middlewares which process the incoming requests before handling them down to the routes |
| **src/modules** | Common functions to be used across the app. |
| **src/routes** | Contain all express routes |
| **src**/app.js | Setting app |
| **src**/server.js | Entry point to express app |
| .env | Contains all secret configurations |
| package.json | Contains npm dependencies |

## Paths
All paths in this project
```
/api
    /airports
        /all [get] : Get all airports data.
    /booking
        /read [get] : To decrypt the booking data and return in response. This function is built for auditing purpose only (No front-end code call it).
        /book [post] : To encrypt the booking detail and store in database.
    /flights
        /route [get] : Verify and return route data for booking page.
        /search [get] : Return all possible routes that can go from original airport to destination airport within 3 flights(2 stops).
        /add-flight [post] : Add flight to database because flight data stored in database need to put relation key. This function is built for support dev process only (No front-end code call it).
    /permission
        /admin-page [get] : Return permission for user. This project does not encrypt any role or permission in token. So, front-end code cannot define permission by itself.
    /user
        /add-user [post] : Add user to database. This function is built for support dev process only (No front-end code call it).
        /login [post] : Return token which contain only userId.
```

## Requirements and solutions
- 	Develop RESTful APIs to handle search requests and bookings.
    - Create endpoint for search and booking purpose
- 	Implement mock flight data (no need for real-time data integration).
    - Mock flight data and other related fields (airport, airline) will be stored in database after do restoration process in the instruction.
- 	Store booking information securely.
    - Encrypt sensitive data (contact details, passenger details, and payment details) follow Advanced Encryption Standard (AES) 256 with **crypto** lib before store it in database. The codes are in src/utils/encryptions.
-   Implement secure user authentication and authorization.
    - Use jwt to create and verify token before access to sensitive page (booking page, admin).
-   Implement proper input validation and sanitization to prevent SQL injection and XSS attacks.
    - Data has been sanitized from front-end but there are some libs used in back-end to prevent those attacks as well, such as: **xss-clean**, **sanitizem** and **helmet**. The database function to send sql script to compiled in database is designed to prevent injection as well.
-   Handle and store sensitive information (e.g., payment details).
    - Other than AES-256 that used for booking encryption, user's password are also hash before store as well.
-   Implement proper error handling without exposing sensitive information.
    - No sensitive information sent as response.
-   Add basic logging for auditing purposes.
    - There is console.log before response in every functions. The log for auditing will be highlighted with **chalk**.
-   Implement basic role-based access control.
    - There are 2 role for users; admin and user. This will be checked when user access to admin page.
-   Consider scalability in your design.
    - Structure of this repo is designed for future scalability.
