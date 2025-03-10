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

*check database just to make sure that the seed data is entered*
If there is no seed data in your database, please run seeding first

```bash
npm run prisma:seed
```

## Run Development
Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
