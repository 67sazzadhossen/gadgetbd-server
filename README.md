# GadgetBD

## Live Link  
[Visit GadgetBD](https://gadgetbd-client.vercel.app/)

---

## Accounts

### Buyer Account  
- **Email**: phero@gmail.com  
- **Password**: P@hero331  

### Seller Account  
- **Email**: phero.seller@gmail.com  
- **Password**: P@hero331  

### Admin Account  
- **Email**: phero@gmail.com  
- **Password**: P@hero331  

---

## GitHub Links  
- **Client Repository**: [GadgetBD Client](https://github.com/67sazzadhossen/gadgetbd_client)  
- **Server Repository**: [GadgetBD Server](https://github.com/67sazzadhossen/gadgetbd-server)  

---

## Description  
When a user signs up for the first time, they are automatically assigned the **buyer** role. Users can request the admin to upgrade their role to either **admin** or **seller**.  

---

## Installation Instructions

### Client and Server
```bash
# Clone the client repository
git clone https://github.com/67sazzadhossen/gadgetbd_client.git
cd gadgetbd_client

# Install dependencies
npm install

# Add environment variables
# Create a `.env.local` file in the root directory and add the following variables:
VITE_apiKey=AIzaSyA29X66MOWQ7NZ-SaDKxD__CK9iCWrD5fs
VITE_authDomain=gadgetbd-34cc4.firebaseapp.com
VITE_projectId=gadgetbd-34cc4
VITE_storageBucket=gadgetbd-34cc4.firebasestorage.app
VITE_messagingSenderId=588576697130
VITE_appId=1:588576697130:web:26748667b2ad418a52cc53
VITE_IMAGE_API_KEY=fe35fcaec279368849eb9b9432934a38

# Run the application
npm run dev


** Server **

# Clone the server repository
git clone https://github.com/67sazzadhossen/gadgetbd-server.git
cd gadgetbd-server

# Install dependencies
npm install

# Add environment variables
# Create a `.env` file in the root directory and add the following variables:
MONGO_USER=gadgetdb
MONGO_PASS=195468
JWT_SECRET=eae937a58a5d3a70872593d6928172c3847ff100c485d07d833d4ffdc79b6491d3e1416cd2c4d543cd28d6c5c95709712f884967a4977bf86ea8e413653b095f

# Optional example for `.env` file:
# PORT=5000
# DATABASE_URL=your_database_url
# JWT_SECRET=your_secret_key

# Run the server
npm start
