# JanVote AI – Intelligent Election Education Assistant

JanVote AI is a production-grade intelligent assistant designed to educate citizens about the democratic process in India. It leverages Google Gemini AI to provide context-aware guidance, interactive simulations, and accessibility tools for all types of voters.

## 🚀 Problem Statement
Election processes can be intimidating for first-time voters, complex for volunteers, and inaccessible for low-literacy individuals. Misinformation and fear of technology (like EVMs) often hinder democratic participation.

## 💡 Solution Approach
JanVote AI addresses these gaps through:
1.  **Adaptive AI**: Responses that change based on whether you are a first-time voter, a regular voter, or a volunteer.
2.  **Gamified Education**: A realistic Practice Voting Simulator to reduce "EVM anxiety."
3.  **Accessibility First**: Built-in Voice Mode (TTS/STT) and simplified language logic.
4.  **Volunteer Empowerment**: An "Awareness Broadcast Mode" that generates simplified outreach scripts.

## 🛠️ Tech Stack
-   **Frontend**: React 19 (Vite), Tailwind CSS 4, Framer Motion.
-   **Backend**: Node.js + Express (Full-stack architecture).
-   **Database**: Firebase Firestore.
-   **AI Engine**: Google Gemini 3 (via @google/genai).
-   **Authentication**: Firebase Anonymous Auth (for secure profiling).

## 🌟 Key Features
-   **Smart User Profiling**: Context-aware interactions stored in Firestore.
-   **Interactive Election Journey**: A visual stepper explaining registration to results.
-   **Practice Voting Simulator**: A fake EVM interface with feedback loops.
-   **Awareness Broadcast Mode**: AI-powered script generation for volunteers.
-   **Voice Mode**: Speak questions and hear AI responses.
-   **Misinformation Guard**: Strict system prompts to ensure neutrality and exclude political bias.

## 🏗️ Architecture Overview
The app follows a modular React architecture with a clear separation between AI services, Firebase logic, and UI components. The backend uses Express as a container for the SPA and potential future API expansion.

## 🛠️ Setup Instructions
1.  **Firebase**: Ensure `firebase-applet-config.json` is present. Run `set_up_firebase` if not.
2.  **API Keys**: Set `GEMINI_API_KEY` in your environment secrets.
3.  **Run**: `npm run dev` to start the full-stack server.
4.  **Build**: `npm run build` for production static assets.

## 🔮 Future Improvements
-   **Regional Language Expansion**: Support for all 22 official languages of India.
-   **Offline Mode**: Service Worker caching for critical election guidance.
-   **Live Grounding**: Integration with Google Search to provide real-time deadline updates.
