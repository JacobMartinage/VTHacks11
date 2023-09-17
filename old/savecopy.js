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
            "prompt": "Summarize the following transcript:\n\nTails OS a free based AF operating system designed to protect you against malware censorship and surveillance it was first released in 2009 and became famous when Edward Snowden used it to communicate with reporters exposing the government's Mass surveillance programs most personal computers are just cool prisons that track your every movement and harvest your biometric data so advertisers can eventually unburden you from your money Tails OS is a Debian based Linux distro that boots from a USB stick to turn any computer into a temporarily secure machine when you finally discover the true shape of the earth you might think you're clever because you used a private browser and deleted all the files from your computer but traces were left behind on disk that could be recovered via forensic analysis and now they're going to try to unalive you Tails helps you avoid this fate thanks to Amnesia everything you do disappears automatically when the OS shuts down because Tails never writes anything to the hard disk and only runs from the memory on your computer when you get a knock at the door there's no need to rip out your hard drive and flush it down the toilet instead just turn the computer off and all the totally legit it and mundane things you just did will be lost forever however it is possible to store some information on the USB like browser bookmarks or documents that you want to persist between sessions and of course they're encrypted automatically when you boot it up you'll find your favorite canoe utilities but also privacy focused software like the tour browser which routes internet traffic through the Tor Network consisting of multiple layers of encrypted relays where no individual relay knows both where you're coming from and where you're going to conceal your location IP address and usage in fact any application that tries to access the internet without the tour network is automatically blocked on Tails this makes it a great option for journalists working on sensitive topics victims of domestic abuse or anyone who enjoys truly free software where free means freedom what will you do without freedom to get started grab a USB stick with at least eight gigabytes of memory then download the version that matches your current OS now verify the file to ensure that it wasn't corrupted during download then use a tool like etcher to safely flash it on the USB stick next make sure you have the official startup instructions on a separate device then on Windows hold down the the shift key while clicking on the restart button from the start menu then use the option to reboot from a device this will bring up a boot menu where you can select the USB stick at which point you can select Tails from the bootloader and now we're officially running Tails go through the initial setup and most importantly make sure you have a good connection to the tour Network congratulations you now have a private and Anonymous computer everything you do now is stored in random access memory and not on disk in addition when tail shuts down it will overwrite most of the ram to prevent a cold boot attack where someone extracts a memory dump from the ram which is often done in digital forensics to catch the bad guys this has been Tails OS in 100 seconds but don't tell anybody I told you about it thanks for watching and I will see you in the next one [Music]",
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

