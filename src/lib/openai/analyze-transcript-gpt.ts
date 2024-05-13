import axios, { AxiosError } from "axios";

const assistantPrompt = () => {
  return `
  You will receive a transcript from a Youtube video reviewing a whisky bottle.
  First read the review carefully.
  If there are no mention of whisky, return "NOT A WHISKY REVIEW"
  If you suspect errors in the transcript, correct them. Errors can include mispelled product name, unecessary capitalization, or errors in transcription.
  Avoid generating scores of 80 or 8/10. Rate good reviews higher than 80% and bad reviews lower than 80%.
  If many whiskies are mentioned in the transcript, only pay attention to the one I asked you to review.
  Analyze the transcript to extract the following information and respond in JSON format. Do not ommit any fields.

Example of expected output:
{
  "age": "12",  // If not specified, put "non-age statement". Do not leave empty.
  "region": "Highlands", // Specify the region. For Scotch, choose one of Campbeltown, Highland, Islay, Lowland and Speyside, or Islands (if Islands, specify which). For other regions, specify the country.
  "abv": "43", // Specify the numerical value of the ABV in string format. Convert Proof to ABC, e.g. 101 Proof = 50.5% ABV.
  "tags": ["non-chill filtered", "no colour added", "single malt"], // Only include these if mentioned in the transcript. If empty, return an empty array.
  "casks": ["Sherry", "American Oak"], // Extract from transcript.
  "tasteNotes": ["chocolate", "honey", "vanilla", "subtle smoke", "espresso", "oak"], // List the specific tasting notes highlighted as part of the review.
  "tasteQuotes": [
    "It's very light with honey with a bit of vanilla as well.",
    "Subtly smoked but not heavy smoke, kind of caramel sweet." ], // Two to three quotes specifically focussed on the taste. You may correct punctuation and words that were mis-transcribed and remove filler words. You may cut quotes with "[...]" to keep them short.
  "valueQuotes": ["It's very good value for the money."], // One or two quotes that best capture the opinion of the reviewer regarding the affordability of the whisky.
  "opinionQuote": "I really like this blend. It's like a lighter Highland Park.", // One quote that captures the overall opinion of the reviewer.
  "summary": "Highland Park 12 presents as a complex whisky with a balanced interplay of sweet, fruity, floral, and woody notes. The aroma offers hints of honey, vanilla, and heather, with a subtle whiff of smoke adding depth. On the palate, it delivers a syrupy sweetness followed by a journey of flavors, transitioning from honey and vanilla to spicy oak, chocolatey bitterness, and espresso notes. The finish is intense and satisfying, making it a great value for both beginners and intermediate whisky enthusiasts.",
  "sentimentScore": 89, // Assess the sentiment of the reviewer towards the whisky out of 100. A bad whisky is 50, an average one is 65, a good one is 80, a great one is 90.
  "priceScore": 7.5, // If the reviewer mentions a good bargain, good value for money, or affordability, it's a 9 or 10. If they say it is expensive or not worth the price, it is between 5 and 7.
  "complexityScore": 8.5, // Look at the number of different taste notes mentioned and whether they form a complex or simple profile. If the reviewer mentions "complex" or "advanced" in the transcript, put a 9 or 10. If they say "basic" or "simple" put a 5, 6 or 7.
  "overallScore": 8, // Assess the overall rating of the whisky out of 10 based on sentiment, price and complexity.
}
`;
};

async function analyzeTranscriptGpt(transcriptText: string, query: string) {
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
            content:
              "Transcript of a review for " + query + ": " + transcriptText,
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
      // Extract the content from the first choice's message
      const content = response.data.choices[0].message.content;
      console.log(
        "---------ChatGPT Analyzed Transcript -------- ",
        content
        // response.data.choices[0].finish_reason
      );
      return JSON.parse(content); // Assuming the content is in JSON string format
    } else {
      console.error("Non-200 response or no choices available", response.data);
      return {
        error:
          "API request did not return a success status or no choices available.",
      };
    }
  } catch (error: any) {
    console.error("Axios error response:", error.response?.data);
    return { error: "Error during API call to OpenAI." };
  }
}

export default analyzeTranscriptGpt;
