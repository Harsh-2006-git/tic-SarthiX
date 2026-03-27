# Divya Yatra - Your Sacred Journey Planner

Welcome to Divya Yatra, an AI-powered travel planning application designed to help you create personalized itineraries for your sacred journeys. This application leverages the power of generative AI to offer a conversational planning experience and detailed trip schedules.

## Tech Stack

*   **Framework:** [Next.js](https://nextjs.org/) (with App Router)
*   **UI Library:** [React](https://react.dev/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Components:** [ShadCN UI](https://ui.shadcn.com/)
*   **AI Integration:** [Genkit (by Firebase)](https://firebase.google.com/docs/genkit)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)

## Features

*   **AI Itinerary Generation:** Generates detailed, day-by-day travel plans based on user input.
*   **Conversational Planning:** A chat agent (RoamAI) that guides users through the planning process in either English or Hindi.
*   **Manual Planning:** A form for users who prefer to input all their travel details directly.
*   **Text-to-Speech:** AI-generated responses from the chat agent are converted to audio for a more interactive experience.
*   **Real-time Data:** Utilizes tools (via SerpApi) to fetch real-time information about hotels, transportation, and attractions.
*   **Responsive Design:** A clean and modern user interface that works across devices.

## Prerequisites

Before you begin, ensure you have the following installed on your local machine:

*   [Node.js](https://nodejs.org/) (v20 or later recommended)
*   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

## Getting Started

Follow these steps to set up and run the project locally.

### 1. Install Dependencies

Navigate to the project directory and install the required packages:

```bash
npm install
```

### 2. Set Up Environment Variables

The application requires API keys to function correctly.

1.  Create a new file named `.env` in the root of the project.
2.  **Google AI API Key**: This project uses Google's Gemini models via Genkit. You'll need a Google AI API key. You can get one from [Google AI Studio](https://aistudio.google.com/app/apikey).
3.  **SerpApi API Key**: The application uses SerpApi to fetch real-time search data for hotels, trains, and attractions. Sign up for a free account at [SerpApi.com](https://serpapi.com/) to get your API key.
4.  Add your keys to the `.env` file:

    ```env
    GEMINI_API_KEY="your_google_ai_api_key_here"
    SERP_API_KEY="your_serpapi_api_key_here"
    ```
    *Note: If you don't provide a `SERP_API_KEY`, the application will use mock data for search results.*

### 3. Running the Application Locally

To run the application, you need to start both the Next.js frontend and the Genkit AI backend in separate terminal windows.

**Terminal 1: Start the Next.js Development Server**

This command starts the main application on `http://localhost:9002`.

```bash
npm run dev
```

**Terminal 2: Start the Genkit Development Server**

This command starts the Genkit server, which runs your AI flows. The Next.js app communicates with this server.

```bash
npm run genkit:dev
```
Alternatively, you can run Genkit in watch mode to automatically restart when you change an AI flow file:
```bash
npm run genkit:watch
```

Once both servers are running, you can access the application at `http://localhost:9002`.

## Project Structure

Here is a brief overview of the key directories in the project:

*   `src/app/`: Contains the main pages and routing logic for the Next.js application.
    *   `page.tsx`: The main entry point for the UI.
    *   `actions.ts`: Server Actions that connect the frontend to the AI flows.
*   `src/components/`: Contains all the reusable React components.
    *   `ui/`: Auto-generated UI components from ShadCN.
    *   `itinerary-form.tsx`: The manual itinerary planning form.
    *   `chat-agent.tsx`: The conversational AI component.
    *   `itinerary-display.tsx`: The component that renders the final travel plan.
*   `src/ai/`: Holds all the Genkit-related code.
    *   `genkit.ts`: Configures the Genkit instance and the AI model to be used.
    *   `flows/`: Contains the definitions for the different AI workflows (e.g., `chat.ts`, `generate-travel-itinerary.ts`).
*   `src/lib/`: Contains utility functions, type definitions, and other shared library code.

## Building for Production

To create a production build of the application, run:

```bash
npm run build
```

This will compile the application and prepare it for deployment. To run the production server locally, use:

```bash
npm run start
```
