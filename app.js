const express = require('express');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');
const API_KEY = "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";

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/getSummary', async (req, res) => {
    const videoLink = req.body.videoLink;
    const videoID = extractVideoID(videoLink);
    
    const transcript = await fetchTranscript(videoID);
    const summary = await summarize(transcript);
    
    res.json({ summary });
});

function extractVideoID(link) {
    // Extract the video ID from the YouTube link
    const regex = /(?:v=)([^&]+)/;
    const match = link.match(regex);
    return match ? match[1] : null;
}

async function fetchTranscript(videoID) {
    exec(`python transcript_fetcher.py ${videoID}`, (err, stdout, stderr) => {
        if (err) {
            console.log(err);
            return;
        }
        console.log(stdout);
    }
    );
    
    return "sample transcript";
}

async function summarize(transcript) {
    const response = await fetch('https://api.openai.com/v1/engines/davinci-codex/completions', {
        method: 'POST',
        headers: 
        {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            prompt: `Summarize the following transcript: "${transcript}"`,
            max_tokens: 200
        })
    });
    const data = await response.json();
    return data.choices[0].text.trim();
    
}

app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});
