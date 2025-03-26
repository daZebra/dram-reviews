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
  console.log(`[summarizeProduct] Starting product summarization`);
  console.log(
    `[summarizeProduct] Input data length: ${reviewObjects.length} characters`
  );

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.error(`[summarizeProduct] OpenAI API key is missing!`);
    throw new Error("OpenAI API key is not configured.");
  }

  const apiUrl = "https://api.openai.com/v1/chat/completions";
  const assistantMessage = assistantPrompt();

  try {
    console.log(
      `[summarizeProduct] Sending request to OpenAI API using model: gpt-4o-mini`
    );

    const response = await axios.post(
      apiUrl,
      {
        model: "gpt-4o-mini",
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
      console.log(
        `[summarizeProduct] Received successful response from OpenAI API`
      );
      const content = response.data.choices[0].message.content;

      try {
        const parsedContent = JSON.parse(content);
        console.log(`[summarizeProduct] Successfully parsed JSON response`);

        // Log some key fields for debugging
        console.log(`[summarizeProduct] Summary results:
          - Whisky Name: ${parsedContent.whiskyName}
          - Age: ${parsedContent.age}
          - Region: ${parsedContent.region}
          - ABV: ${parsedContent.abv}
          - Sentiment score: ${parsedContent.sentimentScore}
          - Overall score: ${parsedContent.overallScore}
        `);

        return parsedContent;
      } catch (parseError) {
        console.error(
          `[summarizeProduct] Failed to parse OpenAI response as JSON:`,
          parseError
        );
        console.error(`[summarizeProduct] Raw response content:`, content);
        throw new Error("Failed to parse product summary response");
      }
    } else {
      console.error(
        `[summarizeProduct] Non-200 response or no choices available:`,
        {
          status: response.status,
          statusText: response.statusText,
          choices: response.data.choices?.length || 0,
        }
      );
      throw new Error(
        "API request did not return a success status or no choices available"
      );
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        `[summarizeProduct] OpenAI API error (${
          error.response?.status || "unknown"
        }):`,
        error.response?.data || error.message
      );
    } else {
      console.error(
        `[summarizeProduct] Error during API call to OpenAI:`,
        error
      );
    }
    throw error;
  }
};

export default summarizeProductGpt;
