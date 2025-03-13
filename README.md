## Install Dependencies
Install dependencies: 

```bash
npm install
```

# Configure File .env

Copy .env.example to .env: 

```bash
cp .env.example .env
```

Adjust the configuration in the file .env


## Make Database

You need to create database SQL, then migrate database: 

```bash
npx prisma migrate dev
```
Then seed database

```bash
npm run prisma:seed
```

## Run Development
Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Login

You can access the admin panel before that you log in first, you can see the email and password to log in in the file /prisma/seed.js
