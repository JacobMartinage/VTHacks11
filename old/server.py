from flask import Flask, request, jsonify
from youtube_transcript_api import YouTubeTranscriptApi

app = Flask(__name__)

@app.route('/getTranscript', methods=['POST'])
def get_transcript():
    video_id = request.json['videoId']
    transcript = fetch_transcript(video_id)
    return jsonify({'transcript': transcript})

def fetch_transcript(video_id):
    try:
        transcript = YouTubeTranscriptApi.get_transcript(video_id)
        combined_transcript = " ".join([entry['text'] for entry in transcript])
        print(combined_transcript)
        return combined_transcript
    except:
        return None

if __name__ == '__main__':
    app.run(debug=True)
