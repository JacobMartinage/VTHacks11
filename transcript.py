from youtube_transcript_api import YouTubeTranscriptApi

def fetch_transcript(video_id):
    try:
        transcript = YouTubeTranscriptApi.get_transcript(video_id)
        combined_transcript = " ".join([entry['text'] for entry in transcript])
        return combined_transcript
    except:
        return None