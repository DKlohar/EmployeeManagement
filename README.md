\# Employee Management System



A full-stack Employee Management System built using ASP.NET Core Web API, React, and SQL Server.



\## Tech Stack



\*\*Backend\*\*

\- C#

\- ASP.NET Core Web API

\- Entity Framework Core

\- SQL Server

\- REST APIs

\- Dependency Injection

\- Middleware and Exception Handling



\*\*Frontend\*\*

\- React

\- Vite

\- JavaScript

\- HTML and CSS



\## Features



\- Employee management

\- Department management

\- Designation management

\- REST API integration

\- Pagination

\- Reusable React components

\- Form validation and confirmation dialogs

\- Centralized API communication

\- Exception handling middleware



\## Project Structure



```text

EmployeeManagement/

├── EmployeeAPI/

│   └── EmployeeAPI/

│       ├── Controllers/

│       ├── DTOs/

│       ├── Data/

│       ├── Helpers/

│       ├── Middleware/

│       ├── Models/

│       ├── Repositories/

│       └── Services/

└── employee-frontend/

&#x20;   ├── src/

&#x20;   │   ├── components/

&#x20;   │   ├── hooks/

&#x20;   │   ├── pages/

&#x20;   │   ├── services/

&#x20;   │   └── utils/

&#x20;   └── package.json

```



\## Prerequisites



\- .NET SDK compatible with the backend project

\- Node.js and npm

\- SQL Server

\- Git



\## Getting Started



\### 1. Clone the repository



```bash

git clone https://github.com/DKlohar/EmployeeManagement.git

cd EmployeeManagement

```



\### 2. Configure the database



Configure your SQL Server connection string using local configuration or .NET User Secrets. Do not commit passwords, encryption keys, or other secrets to Git.



Configure the encryption key through .NET User Secrets for the Development environment.



\### 3. Run the backend API



Open a terminal in the backend project directory:



```bash

cd EmployeeAPI/EmployeeAPI

dotnet restore

dotnet run

```



Check the API URL printed in the terminal. If Swagger is enabled in the Development environment, open the Swagger URL shown there.



\### 4. Run the React frontend



Open another terminal from the repository root:



```bash

cd employee-frontend

npm install

npm run dev

```



Open the local URL printed by Vite in the terminal.



\## Configuration Notes



\- Keep local configuration files and credentials out of version control.

\- Ensure the SQL Server database and required tables are available before using the application.

\- Configure the frontend API base URL to match the backend URL.



\## Future Improvements



\- Automated testing

\- Authentication and authorization

\- Cloud deployment

\- CI/CD pipeline



\## Author



\*\*Dinesh Kumar Lohar\*\*



GitHub: \[DKlohar](https://github.com/DKlohar)

