#!/usr/bin/env python3
"""
Simple test script for the YouTube Transcript API
Usage: python test_transcript.py <video_id>
"""

import sys
import json
from youtube_transcript_api import YouTubeTranscriptApi

def get_transcripts(video_id):
    """Get transcripts for a YouTube video using the YouTube Transcript API"""
    print(f"\n=== Testing YouTube Transcript API for video: {video_id} ===\n")
    print(f"Video URL: https://www.youtube.com/watch?v={video_id}")
    
    try:
        print("\n1. Using direct fetch method first:")
        try:
            ytt_api = YouTubeTranscriptApi()
            fetched_transcript = ytt_api.fetch(video_id)
            
            print(f"Success! Found transcript with {len(fetched_transcript)} entries")
            print(f"Language: {fetched_transcript.language}")
            print(f"Is generated: {fetched_transcript.is_generated}")
            
            # Convert to raw data for processing
            transcript_data = fetched_transcript.to_raw_data()
            
            # Show sample
            print("\nSample transcript content (first 3 entries):")
            for i, entry in enumerate(transcript_data[:3]):
                print(f"[{entry['start']:.2f}s - {entry['start'] + entry['duration']:.2f}s]: {entry['text']}")
            
            # Show full transcript
            full_text = ' '.join([item['text'] for item in transcript_data])
            print(f"\nTranscript length: {len(full_text)} characters")
            print(f"Transcript entries: {len(transcript_data)} snippets")
            print("\nTranscript preview (first 300 chars):")
            print(f"\"{full_text[:300]}...\"")
            
            return {
                "transcript_data": transcript_data,
                "full_text": full_text,
                "language": fetched_transcript.language,
                "language_code": fetched_transcript.language_code,
                "is_generated": fetched_transcript.is_generated
            }
            
        except Exception as e1:
            print(f"Direct fetch failed: {type(e1).__name__}: {str(e1)}")
            print("\nTrying alternative list_transcripts approach...\n")
        
        # Try the list_transcripts approach as fallback
        print("\n2. Listing available transcripts:")
        transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
        
        available_transcripts = []
        for transcript in transcript_list:
            transcript_info = {
                "language": transcript.language,
                "language_code": transcript.language_code,
                "is_generated": transcript.is_generated,
                "is_translatable": transcript.is_translatable
            }
            available_transcripts.append(transcript_info)
            print(f"- {transcript.language} ({transcript.language_code}) - Generated: {transcript.is_generated}")
        
        if not available_transcripts:
            print("No transcripts found for this video.")
            return None
        
        # Try to get English transcript first
        print("\n3. Fetching transcript content:")
        try:
            transcript = transcript_list.find_transcript(['en'])
            print(f"Found English transcript: {transcript.language}")
        except:
            # If English isn't available, get the first one
            print("English transcript not found, using first available")
            transcript = next(iter(transcript_list))
            print(f"Using transcript in {transcript.language}")
        
        # Fetch the actual transcript data
        print("\nFetching transcript data...")
        transcript_data = transcript.fetch()
        
        # Process the data based on its format
        if hasattr(transcript_data, 'to_raw_data'):
            print("Transcript data is an object, converting to raw data")
            transcript_data = transcript_data.to_raw_data()
        
        # Show sample (assuming list of dicts format)
        try:
            print("\nSample transcript content (first 3 entries):")
            for i, entry in enumerate(transcript_data[:3]):
                if isinstance(entry, dict) and 'text' in entry:
                    print(f"[{entry.get('start', 0):.2f}s]: {entry['text']}")
                else:
                    print(f"Entry {i}: {str(entry)[:100]}")
            
            # Try to extract full text
            if all(isinstance(item, dict) and 'text' in item for item in transcript_data):
                full_text = ' '.join([item['text'] for item in transcript_data])
                print(f"\nTranscript length: {len(full_text)} characters")
                print(f"Transcript entries: {len(transcript_data)} snippets")
                print("\nTranscript preview (first 300 chars):")
                print(f"\"{full_text[:300]}...\"")
                
                return {
                    "available_transcripts": available_transcripts,
                    "transcript_data": transcript_data,
                    "full_text": full_text
                }
            else:
                print("\nUnable to process transcript data into text. Raw format:")
                print(str(transcript_data)[:500] + "...")
                return {
                    "available_transcripts": available_transcripts,
                    "transcript_data": transcript_data
                }
                
        except Exception as e:
            print(f"\nError processing transcript data: {str(e)}")
            print("Raw transcript data type:", type(transcript_data))
            print("Raw data preview:", str(transcript_data)[:500])
            return {
                "available_transcripts": available_transcripts,
                "raw_transcript_data": str(transcript_data)[:1000]
            }
    
    except Exception as e:
        print(f"\nERROR: {type(e).__name__}: {str(e)}")
        print("\nThis suggests either:")
        print("1. The video doesn't have any transcripts/captions")
        print("2. YouTube is blocking the request")
        print("3. There's an issue with the YouTube Transcript API")
        return None

def main():
    if len(sys.argv) < 2:
        print("Please provide a YouTube video ID")
        print("Usage: python test_transcript.py <video_id>")
        sys.exit(1)
    
    video_id = sys.argv[1]
    result = get_transcripts(video_id)
    
    if result:
        # Save the transcript to a file for inspection
        try:
            with open(f"transcript_{video_id}.json", "w") as f:
                json.dump(result, f, indent=2)
            print(f"\nTranscript saved to transcript_{video_id}.json")
            print("\nSUCCESS: Transcript API is working correctly!")
        except Exception as e:
            print(f"\nError saving transcript to file: {str(e)}")
            print("Transcript may be too complex to serialize to JSON")
            print("\nHowever, transcripts WERE successfully retrieved!")
    else:
        print("\nFAILURE: Could not retrieve transcript for this video.")

if __name__ == "__main__":
    main() 