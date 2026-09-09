# Project Setup

Follow the steps below to run the project locally on your computer. This assumes you never used github before.

---

## 1. Install Required Tools

### Install Node.js

1. Go to: https://nodejs.org/
2. Download the **LTS version**
3. Install it using the default options

To check if it worked, open **Command Prompt (Windows)** or **Terminal (Mac/Linux)** and run:

```bash
node -v
```

You should see a version number.

---

### Install Docker

1. Go to: https://www.docker.com/products/docker-desktop/
2. Download and install Docker Desktop
3. Open Docker and make sure it is running


---

## 2. Download the Project

Open your terminal and run:

```bash
git clone git@github.com:LucianoDLima/rs3-clan-manager.git
```

Then go into the project folder:

```bash
cd rs3-clan-manager
```

---

## 3. Install Project Dependencies

Run:

```bash
npm install
```

This may take a few minutes.

---

## 4. Start the Database (Docker)

Run:

```bash
docker compose up -d
```

Wait a few seconds for it to fully start.

---

## 5. Setup the Database (Prisma)

Run:

```bash
npx prisma db push
```

This creates the database structure.

---

## 6. Run the Project

Start the app:

```bash
npm run dev
```


