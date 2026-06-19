// frontend/src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authService = {
  signup: async (email, password) => {
    const response = await api.post('/auth/signup', { email, password });
    return response.data;
  },
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  }
};

// --- NEW CHAT SERVICE CONNECTION ---
export const chatService = {
  sendMessage: async (message) => {
    // Sends the text input to our FastAPI chat endpoint
    const response = await api.post('/chat/', { message });
    return response.data; // Returns {"reply": "..."} from Gemini
  }
};
// -----------------------------------

export default api;