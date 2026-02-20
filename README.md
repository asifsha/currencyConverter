# 🌍 Currency Converter API & Frontend

A full-stack currency conversion application featuring a **.NET 8 Backend API** and a **React + TypeScript Frontend**. This project demonstrates live exchange rate integration, historical data tracking, JWT authentication, and modern UI patterns.

---

## 🚀 Setup Instructions

### 🔧 Backend
1. **Navigate to the backend folder**:
   ```bash
   cd backend/CurrencyConverter.Api

   Restore and Build:

Bash
dotnet restore
dotnet build
Run the API:

Bash
dotnet run
Access Swagger UI:

URL: http://localhost:12046/swagger

Tip: Use the /auth/login endpoint to get a JWT, then use the "Authorize" button to unlock protected routes.

💻 Frontend
Navigate to the frontend folder:

Bash
cd frontend/currency-converter-ui
Install dependencies:

Bash
npm install
Start the development server:

Bash
npm run dev
View the App:

URL: http://localhost:5173

🏗️ Architecture Overview
Backend (.NET 8 Web API)
Controllers:

AuthController: Login and JWT generation.

RatesController: Conversion logic, latest, and historical data.

HealthController: System health status.

Middleware: Custom JWT authentication, global error handling, and structured logging.

Features: Auto-refreshing Swagger docs and external API integration for real-time rates.

Frontend (React + TypeScript)
Pages:

LoginPage: Secure user authentication.

ConvertPage: Real-time currency conversion interface.

HistoricalRatesPage: Data visualization with pagination and date range filtering.

Technical Stack: Axios for HTTP requests, React Context for state management, and strict TypeScript for type safety.

🤖 AI Usage & Credits
This project utilized ChatGPT, GitHub Copilot, and Gemini to optimize logic and accelerate development.

Assistance provided in: Boilerplate generation, Middleware implementation, Observability patterns, and Swagger configuration.

⚖️ Assumptions & Trade-offs
Auth: Simple hard-coded credentials used for demonstration (expandable to DB-based Identity).

JWT: Tokens are set to a 1-hour expiration.

Data: Historical rates are paginated; no caching implemented yet to ensure real-time data accuracy during evaluation.

API: Frontend assumes the backend runs at http://localhost:12046.

📈 Future Improvements
[ ] Implement proper database-backed user authentication (EF Core).

[ ] Add Redis Caching for latest rates to reduce external API overhead.

[ ] Implement rate limiting and API key protection.

[ ] Add comprehensive Unit and Integration tests (xUnit & React Testing Library).

[ ] Deploy to cloud with CI/CD pipelines (Docker/Azure).

[ ] Enhance UI with currency symbols, flags, and historical charts (Recharts).

💡 Usage Tips
Swagger Authorization:

Login via /api/v1/auth/login.

Copy the returned token.

Click Authorize in Swagger.

Type Bearer  followed by your token (e.g., Bearer eyJhbGci...).

Health Check: Use /api/v1/health to verify the API status.
