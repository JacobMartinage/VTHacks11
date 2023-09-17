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
    console.log("Received video link:", videoLink);

    const videoID = extractVideoID(videoLink);
    console.log("Extracted video ID:", videoID);

    const transcript = await fetchTranscript(videoID);
    console.log("Fetched transcript:", transcript);

    const summary = await summarize(transcript);
    console.log("Generated summary:", summary);

    res.json({ summary });

});

function extractVideoID(link) {
    // Extract the video ID from the YouTube link
    const regex = /(?:v=)([^&]+)/;
    const match = link.match(regex);
    return match ? match[1] : null;
}

function fetchTranscript(videoID) {
    const { exec } = require('child_process');

    return new Promise((resolve, reject) => {
        exec(`python transcript_fetcher.py ${videoID}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing script: ${error}`);
                reject(error);
                return;
            }

            if (stderr) {
                console.error(`Python Error: ${stderr}`);
                reject(new Error(stderr));
                return;
            }

            resolve(stdout);
        });
    });
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
