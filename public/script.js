const form = document.getElementById('videoForm');
const summaryDiv = document.getElementById('summary');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const videoLink = e.target.videoLink.value;

    try {
        const response = await fetch('http://localhost:3000/getSummary', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ videoLink })
        });

        const data = await response.json();

        if (data.error) {
            summaryDiv.textContent = data.error;
        } else {
            summaryDiv.textContent = data.summary;
            document.getElementById("summary").innerHTML = data.summary;
        }
    } catch (err) {
        summaryDiv.textContent = 'Error fetching summary. Please try again later.';
    }
});
