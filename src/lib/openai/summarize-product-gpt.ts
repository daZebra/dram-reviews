import axios, { AxiosError } from "axios";

const assistantPrompt = () => {
  return `
  Your job is to craft a whisky summary based on multiple review objects (in JSON format).
  Your summary should distill the key insights from each review.
  Average numerical values, except ABV. If ABV differs between reviews, pick the lowest one. 
  Avoid repetition whenever possible.
  If the "age" is not specified, put "non-age statement".
  Limit maximum number of tastingNotes to 10, focussing on the most frequently mentioned notes. Order them from most important to least. 
  Sentiment score is out of 100, other scores are out of 10.
  Ensure the whiskyName is properly spelled, do not put "years old" after the number of years (e.g. just write "Highland Park 12"). 
  All fields are required. NEVER LEAVE A FIELD EMPTY!
  Structure your response in JSON format.

Example of expected output:
{
  "whiskyName": "Highland Park 12",
  "age": "12",  
  "region": "Highlands", 
  "abv": "43", 
  "tags": ["non-chill filtered", "no colour added", "single malt"], 
  "casks": ["Sherry", "American Oak"], 
  "sentimentScore": 89,
  "overallScore": 8,
  "priceScore": 7.5,
  "complexityScore": 8.5,
  "tasteNotes": ["honey", "vanilla", "chocolate", "subtle smoke", "espresso", "oak"],
  "summary": "Highland Park 12 presents as a complex whisky with a balanced interplay of sweet, fruity, floral, and woody notes. The aroma offers hints of honey, vanilla, and heather, with a subtle whiff of smoke adding depth. On the palate, it delivers a syrupy sweetness followed by a journey of flavors, transitioning from honey and vanilla to spicy oak, chocolatey bitterness, and espresso notes. The finish is intense and satisfying, making it a great value for both beginners and intermediate whisky enthusiasts."
}`;
};

const summarizeProductGpt = async (reviewObjects: string) => {
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
          { role: "user", content: reviewObjects },
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

      console.log(
        " ---------- Analyze Transcript Finish Reason ----------: " +
          response.data.choices[0].finish_reason
      );
      console.log(
        " ---------- Analyze Transcript Response ----------: " + content
      );

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

export default summarizeProductGpt;
