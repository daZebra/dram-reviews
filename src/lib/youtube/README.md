# YouTube Transcript Testing Tools

This directory contains tools to test YouTube transcript fetching using both the current cloud function approach and the direct YouTube Transcript API approach.

## Testing Options

You have two options for testing:

1. **TypeScript Test** - Tests the current cloud function and has commented code for direct API usage
2. **Python Test** - Fully functional test of both approaches (recommended for initial testing)

## Option 1: TypeScript Test

### Setup

```bash
# Navigate to this directory
cd src/lib/youtube

# Install dependencies
npm run install-deps

# Run the test with a YouTube video ID
npx ts-node transcript-test.ts dQw4w9WgXcQ
```

This test will show you the results from the cloud function. To test the direct API approach, you'll need to:

1. Install the YouTube Transcript API package: `npm install youtube-transcript-api`
2. Uncomment the code in the `testDirectApi` function in `transcript-test.ts`

## Option 2: Python Test (Recommended)

The Python test is recommended because the YouTube Transcript API was originally designed for Python and has more features available.

### Setup

```bash
# Install Python dependencies
pip install youtube-transcript-api requests

# Run the test with a YouTube video ID
python src/lib/youtube/transcript-test.py dQw4w9WgXcQ
```

This will test both approaches and show you detailed information about available transcripts.

## Test Videos

Try these video IDs that should have transcripts:

- `dQw4w9WgXcQ` - Rick Astley - Never Gonna Give You Up
- `jNQXAC9IVRw` - Me at the zoo (First YouTube video)
- `eg-F_NNTbLE` - Whisky Review/Tasting: Scapa Skiren

## Analyzing Results

Compare the results from both approaches to see:

1. Whether transcripts are available for each video
2. If the cloud function is retrieving transcripts correctly
3. What languages are available for each video
4. The quality and length of transcripts

## Next Steps

After testing, you can decide whether to:

1. Fix the cloud function implementation
2. Implement the YouTube Transcript API directly in your Next.js application
3. Create a new API endpoint in your Next.js app that uses the YouTube Transcript API
