import axios, { AxiosError } from "axios";

const assistantPrompt = () => {
  return "You will be provided with a transcript from a YouTube video reviewing a specific whisky bottle. Analyze the transcript to extract quotes and organize them into the following categories: 1. Taste Profile: Extract up to three quotes that describe the taste of the whisky. Ensure each quote is succinct and directly related to the sensory experience (e.g., flavors, aromas). 2. Review: Extract up to three quotes that discuss the overall review of the whisky, including any scores or general appreciation mentioned. 3. Critique: Extract up to three quotes that specifically critique the whisky. Ensure the criticism is targeted towards the whisky itself (e.g., taste, packaging) rather than external factors (e.g., brand, reputation). 4. Rating: Find and include one numerical score given to the whisky in the review and specify the numerator even if implied (e.g. x/10 or xx/100), return N/A if no scores were provided. Correct any grammatical or punctuation errors and fix the syntax to ensure legibility of the quote. Do not fabricate details. Structure your response as a JSON object with the following format: { 'tasteProfile': ['quote1', 'quote2', 'quote3'], 'whiskyReview': ['quote1', 'quote2', 'quote3'], 'critique': ['quote1', 'quote2', 'quote3'], 'rating': 'numeric_score'} Limit to three quotes per category.";
};

const analyzeTranscriptGpt = async (transcriptText: string) => {
  const apiKey = process.env.OPENAI_API_KEY; // Ensure your API key is stored securely in environment variables
  const apiUrl = "https://api.openai.com/v1/chat/completions";
  const assistantMessage = assistantPrompt();

  try {
    const response = await axios.post(
      apiUrl,
      {
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: assistantMessage },
          { role: "user", content: transcriptText },
        ],
        temperature: 0.6,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 200 && response.data.choices.length > 0) {
      // Extract the content from the first choice's message
      const content = response.data.choices[0].message.content;
      return JSON.parse(content); // Assuming the content is in JSON string format
    } else {
      console.error("Non-200 response or no choices available", response.data);
      return {
        error:
          "API request did not return a success status or no choices available.",
      };
    }
  } catch (error: AxiosError | any) {
    console.error("Axios error response:", error.response?.data);
    return { error: "Error during API call to OpenAI." };
  }
};

export default analyzeTranscriptGpt;
