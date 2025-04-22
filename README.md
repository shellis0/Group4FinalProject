# Smart Inventory System

A full-stack inventory management application designed to help small businesses monitor stock levels, track restock thresholds, and streamline operations. Built with **Next.js**, **Prisma**, and **Ant Design**, this system offers real-time updates, search, filtering, and cloud deployment options via **AWS**.

## Key Features

- Add, Edit, and Delete inventory items
- Visual Restock Alerts
- Category-based filtering
- Search by name or description
- Detail view for each item
- Last Updated timestamp tracking
- Sorted by most recently updated
- Built with Ant Design UI framework

## Technologies Used

- **Next.js** – React-based full-stack framework
- **Prisma** – ORM used with SQLite and MySQL RDS
- **SQLite** – Local development database
- **MySQL RDS** – Cloud-hosted database for production (AWS)
- **EC2** – AWS virtual machine for deployment
- **Ant Design** – UI library for forms, tables, and modals
- **VS Code** – Used for local development and testing

## Group Members & Responsibilities

| Member              | Responsibilities |
|---------------------|------------------|
| **Sewhenu Ayeni**   | Amazon RDS setup, database schema design, backend endpoint documentation, group coordination, presentation support |
| **Kalyani Nannapaneni** | Backend API development and RDS integration |
| **Shane Ellis**     | EC2 instance configuration and project deployment |
| **Brayson Brownlee** | Frontend development, UI/UX implementation using Ant Design |
| **Swetha Ulli**     | Implementation of restock alert logic, item sorting, and item detail rendering |
| **Dio Moreno**      | Testing and debugging the full application, compiling project screenshots, and preparing final presentation slides |

> *Note: All members collaborated closely on planning and quality assurance. For simplicity, code commits were centralized from a single machine, but testing, feedback, and documentation were shared responsibilities.*

# Run on your local machine

- Step 1, clone this project to your local machine and within the project root folder 
  install dependencies
```bash
npm i
```
- Step 2, setup database of sqlite (which is just an in 
memory database only for the ease of testing)
    - make sure the prisma/schema.prisma file has this
  ```c
    datasource db {
      provider = "sqlite" 
      url      = env("DATABASE_URL")     
    }
  ```
    - Then Run a migration to create your database tables with Prisma Migrate
    ```bash
    npx prisma migrate dev --name init
    ```
- Step 3, run dev server to serve the NextJS web app
    ```bash
    npm run dev
    ```

# Run on aws ec2 with a mysql RDS

- Step 0, fire up ec2 and mysql rds, set up correctly with their security rules
    > By default, nextjs dev server run on port 3000 of http, so allow it's request
- Step 1, clone this project to the ec2 and within the project root folder
  install dependencies
```bash
npm i
```
- Step 2, setup database of mysql rds 
    - ***make sure the prisma/schema.prisma file has this***
  ```c
    datasource db {
      provider = "mysql" 
      url      = "mysql://USER:PASSWORD@HOST:PORT/DATABASE"  
    }
  ```
  > Change the USER, PASSWORD, PORT and DATABASE of your mysql rds, specifically
  > you have to have an existing DATABSE within mysql. 
  > Tables can be created by prisma

    - Then Run a migration to create your database tables with Prisma Migrate
    ```bash
    npx prisma migrate dev --name init
    ```
- Step 3, run dev server to serve the NextJS web app
    ```bash
    npm run dev
    ```


##