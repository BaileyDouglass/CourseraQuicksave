// Handle Checkbox for saving required course files
let saveFilesCheckbox = document.getElementById('saveFilesToggle');

// Detect download button being clicked, and send message to active window to start download process from there
const downloadTranscriptBtn = document.getElementById("downloadTranscriptBtn");
if (downloadTranscriptBtn) {
    downloadTranscriptBtn.onclick = function() {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            chrome.tabs.sendMessage(
                tabs[0].id,
                {
                    msg: "downloadTranscript"
                },
                function(response) {
                    window.close();
                }
            );
        });
    };
}