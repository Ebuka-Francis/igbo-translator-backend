# Igbo Translator Backend

This is the backend API for the Igbo Translator application. It provides services for text translation, user authentication, and maintaining system health.

## Features

- **Translation API**: Translates English text to Igbo using a combination of a local database and the Google Translate API (via RapidAPI).
- **Caching**: Stores translations in MongoDB to reduce API calls and improve performance for frequently requested texts.
- **Authentication**: Secure user registration and login using JWT (JSON Web Tokens) with access and refresh tokens.
- **Scheduled Jobs**: Includes a cron job to keep the server active (useful for free-tier deployments).

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (via Mongoose)
- **Authentication**: bcryptjs, jsonwebtoken
- **External API**: Google Translate via RapidAPI
- **Utilities**: Cron, Axios, Cors, Dotenv

## Prerequisites

Before running this project, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local or AtlasURI)

## Getting Started

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd igbo-translator-backend
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Configuration**
    Create a `.env` file in the root directory and add the following variables:

    ```env
    # Server Configuration
    PORT=5000
    MONGODB_URI=mongodb://localhost:27017/igbo-translator
    
    # Authentication
    JWT_SECRET=your_jwt_secret_key
    JWT_REFRESH_SECRET=your_jwt_refresh_secret_key
    ACCESS_TOKEN_EXPIRY=15m
    REFRESH_TOKEN_EXPIRY=7d
    
    # External APIs
    RAPIDAPI_KEY=your_rapidapi_key
    
    # Cron Job (Optional - for self-pinging)
    API_URL=http://localhost:5000
    ```

4.  **Run the application**

    - **Development mode** (with nodemon):
      ```bash
      npm run dev
      ```
    - **Production start**:
      ```bash
      npm start
      ```
    - **Seed Database** (Optional):
      ```bash
      npm run seed
      ```

## API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint    | Description |
| :---   | :---        | :---        |
| POST   | `/register` | Register a new user |
| POST   | `/login`    | Login a user and receive tokens |
| POST   | `/refresh`  | Refresh access token using a refresh token |
| GET    | `/getUser`  | Get current user profile (Protected) |
| POST   | `/logout`   | Logout user (Protected) |

### Translation (`/api/translate`)

| Method | Endpoint | Description |
| :---   | :---     | :---        |
| POST   | `/`      | Translate text from English to Igbo. Body: `{ "text": "Hello" }` |

### Health Check

| Method | Endpoint | Description |
| :---   | :---     | :---        |
| GET    | `/`      | Returns a simple message to confirm the API is running |

## Cron Job

The application includes a cron job configured in `config/cron.js` that pings the server every 14 minutes. This is designed to prevent the server from sleeping on platforms like Render or Heroku's free tiers. ensure `API_URL` is set correctly in your environment variables for this to work effectively.

## License

This project is licensed under the ISC License.
