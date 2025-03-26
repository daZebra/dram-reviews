#!/usr/bin/env python3
"""
Comprehensive YouTube Transcript Tester for Whisky Reviews

This script tests the YouTube Transcript API specifically for whisky review videos
and simulates the workflow needed for the whisky reviews application.

Usage: python whisky_transcript_tester.py <whisky_name> [--video_limit=10]
"""

import sys
import json
import argparse
import time
import requests
import random
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api.formatters import TextFormatter

# YouTube API key - replace with your own
YOUTUBE_API_KEY = ""  # Add your YouTube API key here if needed

# Helper function to search for videos on YouTube
def search_youtube_videos(query, max_results=10):
    if not YOUTUBE_API_KEY:
        print("⚠️ YouTube API key not provided. Using sample video IDs instead.")
        # Sample whisky review video IDs to use when no API key is provided
        sample_ids = [
            "QtUSxUwCqlg",  # Lagavulin 16
            "gKR5MlWCDqE",  # Lagavulin 16 another review
            "cP9SASwtHqQ",  # Lagavulin review
            "wcXk4rGDfVQ",  # Lagavulin review
            "eg-F_NNTbLE",  # Scapa Skiren
            "dQw4w9WgXcQ",  # Not a whisky review but has transcripts
            "2_9PH_5dUn0",  # Ardbeg 10
            "QdCxuM8aSV0",  # Macallan 12
        ]
        # Filter based on query to simulate search
        filtered_ids = []
        lower_query = query.lower()
        for vid in sample_ids:
            # Randomly include some videos that might not match the query
            if lower_query in vid.lower() or random.random() < 0.3:
                filtered_ids.append(vid)
        
        # Only return requested number of results
        return [{"id": vid, "title": f"Sample Whisky Review {vid}"} for vid in filtered_ids[:max_results]]
    
    print(f"🔍 Searching YouTube for: {query} whisky review")
    
    try:
        url = "https://www.googleapis.com/youtube/v3/search"
        params = {
            "part": "snippet",
            "maxResults": max_results,
            "q": f"{query} whisky review",
            "type": "video",
            "videoDuration": "medium",  # Medium length videos (4-20 mins)
            "relevanceLanguage": "en",
            "key": YOUTUBE_API_KEY
        }
        
        response = requests.get(url, params=params)
        data = response.json()
        
        if "items" not in data:
            print(f"⚠️ YouTube API error: {data.get('error', {}).get('message', 'Unknown error')}")
            return []
        
        results = []
        for item in data["items"]:
            results.append({
                "id": item["id"]["videoId"],
                "title": item["snippet"]["title"],
                "channelTitle": item["snippet"]["channelTitle"],
                "publishedAt": item["snippet"]["publishedAt"],
                "thumbnailUrl": item["snippet"]["thumbnails"]["medium"]["url"]
            })
        
        return results
    
    except Exception as e:
        print(f"⚠️ Error searching YouTube: {str(e)}")
        return []

# Function to fetch transcript for a single video
def get_transcript(video_id):
    print(f"\n📝 Fetching transcript for video: {video_id}")
    
    try:
        ytt_api = YouTubeTranscriptApi()
        fetched_transcript = ytt_api.fetch(video_id)
        
        # Basic transcript info
        print(f"✅ Found transcript with {len(fetched_transcript)} entries")
        print(f"   Language: {fetched_transcript.language}")
        print(f"   Is generated: {fetched_transcript.is_generated}")
        
        # Convert to raw data format
        transcript_data = fetched_transcript.to_raw_data()
        
        # Extract full text
        full_text = ' '.join([item['text'] for item in transcript_data])
        
        # Format for reading
        formatter = TextFormatter()
        formatted_transcript = formatter.format_transcript(fetched_transcript)
        
        return {
            "video_id": video_id,
            "success": True,
            "language": fetched_transcript.language,
            "language_code": fetched_transcript.language_code,
            "is_generated": fetched_transcript.is_generated,
            "transcript_length": len(full_text),
            "entry_count": len(transcript_data),
            "full_text": full_text,
            "formatted_text": formatted_transcript,
            "transcript_data": transcript_data
        }
    
    except Exception as e:
        print(f"❌ Error fetching transcript: {type(e).__name__}: {str(e)}")
        return {
            "video_id": video_id,
            "success": False,
            "error": f"{type(e).__name__}: {str(e)}"
        }

# Main function to test the workflow
def test_whisky_transcript_workflow(whisky_name, video_limit=10):
    print(f"\n🥃 Testing YouTube Transcript API for whisky: {whisky_name}")
    print(f"🎬 Fetching up to {video_limit} videos")
    
    # Step 1: Search for whisky review videos
    videos = search_youtube_videos(whisky_name, video_limit)
    print(f"\n📊 Found {len(videos)} videos for query: {whisky_name}")
    
    # Step 2: Attempt to get transcripts for each video
    transcript_results = []
    successful_transcripts = 0
    failed_transcripts = 0
    
    for i, video in enumerate(videos):
        video_id = video["id"]
        print(f"\n[{i+1}/{len(videos)}] Processing video: {video['title'] if 'title' in video else video_id}")
        
        # Add a slight delay to avoid hitting rate limits
        if i > 0:
            time.sleep(1)
        
        result = get_transcript(video_id)
        transcript_results.append(result)
        
        if result["success"]:
            successful_transcripts += 1
            # Check if transcript is usable (longer than 200 chars)
            if result["transcript_length"] > 200:
                print(f"   ✅ Usable transcript: {result['transcript_length']} characters")
                print(f"   Preview: {result['full_text'][:100]}...")
            else:
                print(f"   ⚠️ Transcript too short: {result['transcript_length']} characters")
        else:
            failed_transcripts += 1
    
    # Step 3: Summarize results
    print("\n🔍 TRANSCRIPT FETCHING SUMMARY:")
    print(f"   Total videos tested: {len(videos)}")
    print(f"   Successful transcripts: {successful_transcripts}")
    print(f"   Failed transcripts: {failed_transcripts}")
    
    success_rate = successful_transcripts / len(videos) if videos else 0
    print(f"   Success rate: {success_rate:.1%}")
    
    # Save detailed results to a file
    results_file = f"whisky_transcript_results_{whisky_name.replace(' ', '_')}.json"
    with open(results_file, "w") as f:
        json.dump({
            "whisky_name": whisky_name,
            "video_count": len(videos),
            "success_count": successful_transcripts,
            "fail_count": failed_transcripts,
            "success_rate": success_rate,
            "results": transcript_results
        }, f, indent=2)
    
    print(f"\n💾 Detailed results saved to: {results_file}")
    
    # Provide recommendation based on success rate
    if success_rate >= 0.7:
        print("\n✅ RECOMMENDATION: The YouTube Transcript API works well for your use case!")
        print("   You can confidently integrate it into your application.")
    elif success_rate >= 0.3:
        print("\n⚠️ RECOMMENDATION: The YouTube Transcript API works partially for your use case.")
        print("   Consider implementing fallback mechanisms or filtering for videos with transcripts.")
    else:
        print("\n❌ RECOMMENDATION: The YouTube Transcript API may not be reliable for your use case.")
        print("   Consider alternative approaches or focusing on videos known to have transcripts.")

def main():
    parser = argparse.ArgumentParser(description='Test YouTube Transcript API for whisky reviews')
    parser.add_argument('whisky_name', help='Name of the whisky to search for')
    parser.add_argument('--video_limit', type=int, default=5, help='Maximum number of videos to check')
    args = parser.parse_args()
    
    test_whisky_transcript_workflow(args.whisky_name, args.video_limit)

if __name__ == "__main__":
    main() 