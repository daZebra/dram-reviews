import axios, { AxiosError } from "axios";

const assistantPrompt = () => {
  return `I want you to act as an expert content marketer and blogger. 
  You receive a youtube video transcript of a product review and convert it into a compelling blog post. 
  Create a blog post for the following review. 
  Note that there may be mistakes in the transcript, especially with Names of products and places. 
  Use your judgement to correct the transcript as necessary.
  Write your answer in HTML format for the content of the article tag:
  "<article>
  [your answer goes here]
  </article>"`; // Fixed missing forward slash for closing article tag.
};

const writeBlogPostGpt = async (transcript: string, title: string) => {
  const apiKey = process.env.OPENAI_API_KEY;
  const apiUrl = "https://api.openai.com/v1/chat/completions";
  const assistantMessage = assistantPrompt();

  try {
    const response = await axios.post(
      apiUrl,
      {
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: assistantMessage },
          {
            role: "user",
            content: `Review for with title: ${title}. Transcript: ${transcript}`,
          },
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
      const content = response.data.choices[0].message.content;
      return content; // Assume content is in plain text or HTML, not JSON
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

export default writeBlogPostGpt;
