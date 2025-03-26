#!/usr/bin/env python3
# Python script to test the YouTube Transcript API
# Install with: pip install youtube-transcript-api
# Run with: python3 src/lib/youtube/transcript-test.py <video_id>

import sys
import json
import requests
from youtube_transcript_api import YouTubeTranscriptApi

def test_cloud_function(video_id):
    """Test the current Cloud Function approach"""
    print(f"Testing Cloud Function with video ID: {video_id}")
    
    try:
        response = requests.post(
            "https://us-central1-youtube-product-reviews-420119.cloudfunctions.net/get_transcripts",
            json={"video_ids": [video_id]}
        )
        
        if response.status_code == 200:
            data = response.json()
            print("Cloud Function Response:")
            print(json.dumps(data, indent=2))
            
            # Check if transcript is usable
            transcript = data.get(video_id)
            if not transcript or transcript == "none" or len(transcript) < 50:
                print("⚠️ Transcript is not usable (null, 'none', or too short)")
            else:
                print(f"✅ Usable transcript found ({len(transcript)} characters)")
            
            return data
        else:
            print(f"Error: Status code {response.status_code}")
            print(response.text)
            return None
    
    except Exception as e:
        print(f"Error with Cloud Function approach: {e}")
        return None


def test_direct_api(video_id):
    """Test the direct YouTube Transcript API approach"""
    print(f"\nTesting direct YouTube Transcript API with video ID: {video_id}")
    
    try:
        # First, list available transcripts
        print("\nAvailable transcripts:")
        transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
        
        for transcript in transcript_list:
            print(f"- {transcript.language} ({transcript.language_code}) - Generated: {transcript.is_generated}")
        
        # Try to get English transcript first
        try:
            transcript = transcript_list.find_transcript(['en'])
            print(f"\nFound transcript in {transcript.language}")
        except:
            # If English isn't available, get the first one
            print("\nEnglish transcript not found, using first available")
            transcript = next(iter(transcript_list))
        
        # Fetch the actual transcript data
        transcript_data = transcript.fetch()
        
        print("\nDirect API Response (first 3 items):")
        print(json.dumps(transcript_data[:3], indent=2))
        print(f"... ({len(transcript_data)} total transcript snippets)")
        
        # Show full transcript text
        full_text = ' '.join([item['text'] for item in transcript_data])
        preview = full_text[:200] + '...' if len(full_text) > 200 else full_text
        print(f"\nTranscript preview: {preview}")
        print(f"Total transcript length: {len(full_text)} characters")
        
        return transcript_data
    
    except Exception as e:
        print(f"Error with direct API approach: {e}")
        return None


def main():
    # Get video ID from command line
    if len(sys.argv) < 2:
        print("Please provide a YouTube video ID as an argument.")
        print("Example: python src/lib/youtube/transcript-test.py dQw4w9WgXcQ")
        sys.exit(1)
    
    video_id = sys.argv[1]
    
    # Display youtube video URL for reference
    print(f"Testing with video: https://www.youtube.com/watch?v={video_id}\n")
    
    # Test current cloud function approach
    test_cloud_function(video_id)
    
    # Test direct API approach
    test_direct_api(video_id)


if __name__ == "__main__":
    main()


# Instructions to run:
# 1. pip install youtube-transcript-api requests
# 2. python src/lib/youtube/transcript-test.py <video_id>
# 3. Try with known videos that should have transcripts:
#    - dQw4w9WgXcQ (Rick Astley - Never Gonna Give You Up)
#    - jNQXAC9IVRw (Me at the zoo - First YouTube video)
#    - eg-F_NNTbLE (Whisky Review/Tasting: Scapa Skiren) 