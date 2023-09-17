import sys
from youtube_transcript_api import YouTubeTranscriptApi

def fetch_transcript(video_id):
    try:
        transcript = YouTubeTranscriptApi.get_transcript(video_id)
        combined_transcript = " ".join([entry['text'] for entry in transcript])
        print(combined_transcript)
        return combined_transcript
    except Exception as e:
        print("Error:", str(e))
        return None

if __name__ == "__main__":
    if len(sys.argv) > 1:
        video_id = sys.argv[1]
        fetch_transcript(video_id)
    else:
        print("Please provide a video ID as an argument.")
