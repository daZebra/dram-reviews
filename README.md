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
- Python 3.6+ (for the YouTube Transcript API)
- pip (Python package manager)

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

3. Install Python dependencies (required for transcript extraction):

```bash
# Option 1: Using our helper script (recommended)
node src/lib/youtube/install-deps.js

# Option 2: Manual installation
pip install youtube-transcript-api
```

4. Setup environment variables (create a `.env.local` file in the root directory):

```
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_URL="your-database-connection-string"
YOUTUBE_API_KEY="your-youtube-api-key"
OPENAI_API_KEY="your-openai-api-key"
```

5. Start the development server:

```bash
npm run dev
```

## Common Issues

### Missing Python Dependencies

If you see an error message like `ModuleNotFoundError: No module named 'youtube_transcript_api'`, you need to install the required Python package:

```bash
pip install youtube-transcript-api
```

You can also run our helper script which will check and install the dependencies for you:

```bash
node src/lib/youtube/install-deps.js
```

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
- Transcripts are fetched using the YouTube Transcript API (Python library)
- OpenAI's GPT models are used to analyze video transcripts and extract structured data
- Results are stored in a database for faster retrieval on subsequent searches

## License

MIT
