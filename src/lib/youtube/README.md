# YouTube Transcript Testing Tools

This directory contains tools to test YouTube transcript fetching using the `youtube-transcript` npm package.

## Testing the API

You can test the transcript API endpoint using the provided test scripts:

```bash
# Start your Next.js server in one terminal
npm run dev

# In another terminal, run the test script
node src/lib/youtube/test-api.js
```

This test will fetch transcripts for a set of predefined YouTube video IDs and display the results.

## Testing Specific Video IDs

To test specific YouTube video IDs:

```bash
# Start your Next.js server first
npm run dev

# In another terminal, run the specific IDs test script
node src/lib/youtube/test-specific-ids.js
```

## Test Videos

The test scripts use these video IDs that should have transcripts:

- `TI0Q7z-4VLs` - Whisky review 1
- `jESHMGi-Ro4` - Whisky review 2
- `7S3kIskUZN0` - Whisky review 3

## Analyzing Results

The test scripts will provide information about:

1. Whether transcripts are available for each video
2. The length of each transcript
3. A preview of the transcript content

## Implementation Details

This application uses the `youtube-transcript` npm package to fetch transcripts from YouTube videos. The package provides:

1. Support for auto-generated captions
2. Language selection (though we default to English)
3. Error handling for cases where transcripts aren't available

The implementation can be found in `youtube-api.ts` which provides a clean interface to the transcript API.
