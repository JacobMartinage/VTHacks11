const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
require('dotenv').config();

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

// Routes
app.post('/getSummary', async (req, res) => {
    console.log("does it even start?");
    const videoLink = req.body.videoLink;
    console.log("videoLink: " + videoLink);
    if (!videoLink) {
        return res.status(400).json({ error: "No YouTube link provided." });
    }
    const videoID = extractVideoID(videoLink);
    console.log("videoID: " + videoID);
    if (!videoID) {
        return res.status(400).json({ error: "Invalid YouTube link provided." });
    }

    try {
        console.log("starting");
        const transcript = await fetchTranscript(videoID);
        console.log("transcript obtained");
        const summary = await summarize(transcript);
        console.log("summary generated");
        res.status(200).json({ summary });  // Send the summary as a response
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

function extractVideoID(link) {
    const regex = /(?:v=)([^&]+)/;
    const match = link.match(regex);
    return match ? match[1] : null;
}

function fetchTranscript(videoID) {
    return new Promise((resolve, reject) => {
        console.log("Fetching transcript...");
        exec(`python3 transcript_fetcher.py ${videoID}`, (error, stdout, stderr) => {
            if (error || stderr) {
                console.error("Error fetching transcript:", error || new Error(stderr));
                reject(error || new Error(stderr));
                return;
            }
            console.log("Returned transcript:", stdout.trim());  
            resolve(stdout.trim());
        });
    });
}

async function summarize(transcript) {
    try {
        const params = {
            "prompt": "Summarize the following transcript:\n\n" + transcript,
            "max_tokens": 500,
            "temperature": 0.1,
            "top_p": 1,
            "frequency_penalty": 0.5,
            "presence_penalty": 0.5,
            
        }

        const response = await fetch('https://api.openai.com/v1/engines/text-davinci-003/completions', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(params)
        });

        if (response.status !== 200) {
            const errorData = await response.json();
            console.error("Error from OpenAI:", JSON.stringify(errorData, null, 2));
            throw new Error(`OpenAI API responded with status: ${response.status} - ${errorData.error}`);
        }
        const data = await response.json();
        console.log("data: " + toString(data));
        console.log(data);
        console.log("Returned summary:", data.choices[0].text.trim());
        return data.choices[0].text.trim();
        

    } catch (error) {
        console.error("Error during summarization:", error.message);
        throw error;
    }
}

// Listen to PORT
app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

