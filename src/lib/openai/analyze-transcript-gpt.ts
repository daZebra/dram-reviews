import axios, { AxiosError } from "axios";
import { logger } from "../logger";

const assistantPrompt = () => {
  return `
  You will receive a transcript from a Youtube video reviewing a whisky bottle.
  Analyze the transcript to extract the following information and respond in JSON format. Do not omit any fields.
  If there are no mention of whisky or this is not a whisky review, respond with {"is_whisky_review": false} and nothing else.
  If you suspect errors in the transcript, correct them when extracting information. Errors can include misspelled product names, unnecessary capitalization, or transcription errors.
  Avoid generating scores of 80 or 8/10. Rate good reviews higher than 80% and bad reviews lower than 80%.
  If many whiskies are mentioned in the transcript, only pay attention to the one I asked you to review.

Example of expected output for a whisky review:
{
  "is_whisky_review": true,
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
  logger.info(`[analyzeTranscript] Analyzing transcript for query: "${query}"`);
  logger.info(
    `[analyzeTranscript] Transcript length: ${transcriptText.length} characters`
  );

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    logger.error(`[analyzeTranscript] OpenAI API key is missing!`);
    throw new Error("OpenAI API key is not configured.");
  }

  const apiUrl = "https://api.openai.com/v1/chat/completions";
  const assistantMessage = assistantPrompt();

  try {
    logger.info(
      `[analyzeTranscript] Sending request to OpenAI API using model: gpt-4o-mini`
    );

    const response = await axios.post(
      apiUrl,
      {
        model: "gpt-4o-mini",
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
      logger.info(
        `[analyzeTranscript] Received successful response from OpenAI API`
      );
      // Extract the content from the first choice's message
      const content = response.data.choices[0].message.content;

      try {
        const parsedContent = JSON.parse(content);
        logger.info(
          `[analyzeTranscript] Successfully parsed JSON response from OpenAI`
        );

        // Check if it's not a whisky review - either through the new format or old format
        if (
          parsedContent.is_whisky_review === false ||
          content.includes("NOT A WHISKY REVIEW")
        ) {
          logger.warn(
            `[analyzeTranscript] GPT determined this is not a whisky review`
          );
          return null;
        }

        // Log some key fields for debugging
        logger.info(`[analyzeTranscript] Analysis results:
          - Product: ${query}
          - Age: ${parsedContent.age}
          - Region: ${parsedContent.region}
          - ABV: ${parsedContent.abv}
          - Sentiment score: ${parsedContent.sentimentScore}
          - Overall score: ${parsedContent.overallScore}
        `);

        return parsedContent;
      } catch (parseError) {
        logger.error(
          `[analyzeTranscript] Failed to parse OpenAI response as JSON:`,
          parseError
        );
        logger.error(`[analyzeTranscript] Raw response content:`, content);
        return null;
      }
    } else {
      logger.error(
        `[analyzeTranscript] Non-200 response or no choices available:`,
        {
          status: response.status,
          statusText: response.statusText,
          choices: response.data.choices?.length || 0,
        }
      );
      return null;
    }
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      logger.error(
        `[analyzeTranscript] OpenAI API error (${
          error.response?.status || "unknown"
        }):`,
        error.response?.data || error.message
      );
    } else {
      logger.error(
        `[analyzeTranscript] Error during API call to OpenAI:`,
        error
      );
    }
    return null;
  }
}

export default analyzeTranscriptGpt;
