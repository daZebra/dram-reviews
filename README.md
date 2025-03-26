# Whisky Reviews App

A Next.js application for searching and analyzing whisky reviews from YouTube videos.

## Features

- Search for whisky reviews across YouTube
- Extract and analyze transcripts from YouTube videos
- Store analyzed reviews in a database for quick access
- Display detailed product information aggregated from multiple reviews

## API Endpoints

### `/api/transcripts`

**Description**: Fetches transcripts for YouTube videos using the YouTube Transcript API.

**Method**: `POST`

**Request Body**:

```json
{
  "video_ids": ["videoId1", "videoId2", ...]
}
```

**Response**:

```json
{
  "videoId1": "transcript text...",
  "videoId2": "none", // If no transcript is available
  ...
}
```

## Setup

### Prerequisites

- Node.js (v16+)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/whisky-reviews.git
cd whisky-reviews
```

2. Install JavaScript dependencies:

```bash
npm install
```

3. Setup environment variables (create a `.env.local` file in the root directory):

```
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_URL="your-database-connection-string"
YOUTUBE_API_KEY="your-youtube-api-key"
OPENAI_API_KEY="your-openai-api-key"
```

4. Start the development server:

```bash
npm run dev
```

## Common Issues

### URL Error in Server Components

If you encounter URL errors in server components, ensure that your `.env.local` file includes:

```
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

This ensures that server components can properly resolve absolute URLs.

## Testing the Transcript API

You can test the transcript API endpoint using the provided test script:

```bash
# Start your Next.js server in one terminal
npm run dev

# In another terminal, run the test script
node src/lib/youtube/test-api.js
```

## Development Notes

- The application uses the YouTube Data API to search for videos
- Transcripts are fetched using the youtube-transcript npm package
- OpenAI's GPT models are used to analyze video transcripts and extract structured data
- Results are stored in a database for faster retrieval on subsequent searches

## License

MIT
