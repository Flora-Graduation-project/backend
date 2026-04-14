import axios from "axios";
import FormData from "form-data";

async function askFloraBot(userMessage) {
  try {
    const formData = new FormData();
    formData.append("message", userMessage);

    const response = await axios.post(process.env.CHATBOT_API_URL, formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error in askFloraBot:", error);
    throw error;
  }
}
export { askFloraBot };
