// Init psuedo-global variables in wide scope for easy handling
let navList, navItems
let courseTitle, courseModule, courseModuleNumber, videoTitle
let sectionRaw, sectionInfo, sectionIndex, sectionTitle
let sidebarActive, sidebarArray, sidebarIndex
let contentType

function updateInfo() {
    // Get object handles for current course directory from the nav-tree
    navList = document.querySelector('.breadcrumb-list')
    navItems = navList.getElementsByTagName('li')
    
    // Parse through directory tree of useful title info for file save later
    courseTitle = navItems[0].querySelector('a').innerText; // Title of entire course
    
    courseModule = navItems[1].querySelector('span').innerText; // "Week 1"
    courseModuleNumber = courseModule.match(/\d+/);
    
    pageTitle = navItems[2].querySelector('span').innerText;
    
    // Get current section info from getting the section tab that's highlighted blue
    sectionRaw = document.querySelector('h2.highlighted button').innerText;
    sectionInfo = sectionRaw.match(/(\d+)\.\s+(.+)/); // Seperate the index number from the title
    sectionIndex = sectionInfo[1] // Index's Position
    sectionTitle = sectionInfo[2] // Title
    
    // Figure out where the current page is in relation to the active section
    sidebarActive = document.querySelector('a[aria-label*=selected]').parentElement
    sidebarArray = Array.from(sidebarActive.parentElement.children)
    sidebarIndex = sidebarArray.indexOf(sidebarActive) + 1 // Sub-section Index's Position
    
    // Check what type of content this page is about; Example: "Video", "Reading", "Quiz"
    contentType = sidebarActive.querySelector('strong').innerText.match(/([^:]+):/)[1];
    // TODO handle all types of content pages
}

function downloadVideoTranscript() {
    $('#downloads-dropdown-btn').click()
    
    let transcriptLink = $('a[download="transcript.txt"]');
    let transcriptHref = transcriptLink.attr('href');
    
    fetch(transcriptHref)
    .then(response => response.blob())
    .then(blob => {
        let tempLink = document.createElement('a');
        tempLink.style.display = 'none';
        tempLink.href = URL.createObjectURL(blob);
        tempLink.setAttribute('download', courseTitle + " " + courseModuleNumber + "." + sectionIndex + "." + sidebarIndex + " [" + contentType + "] " + sectionTitle + " #" + pageTitle + ".txt");
        document.body.appendChild(tempLink);
        tempLink.click();
        document.body.removeChild(tempLink);
    });
}

function downloadReadingTranscript() {
    let assetLinks = document.querySelectorAll('a[data-e2e="asset-download-link"]')
    let assetLinksText
    for (const key in assetLinks) {
        let assetFilename = assetLinks[key].innerText;
        let assetHref = assetLinks[key].href;
        assetLinksText += assetFilename + "\n\t" + assetLinks[key].href + "\n";
    }
    let assetLinksBlob = new Blob([assetLinksText], { type: 'text/plain'})

    const tempAssetsLink = document.createElement('a')
    tempAssetsLink.href = URL.createObjectURL(assetLinksBlob);
    tempAssetsLink.style.display = 'none';
    tempAssetsLink.download = courseTitle + " " + courseModuleNumber + "." + sectionIndex + "." + sidebarIndex + " [" + contentType + " Hyperlinks] " + sectionTitle + " #" + pageTitle + ".txt";
    document.body.appendChild(tempAssetsLink);
    tempAssetsLink.click();
    document.body.removeChild(tempAssetsLink);
}

function initDownload() {
    if (contentType == "Video") {
        downloadVideoTranscript();
        console.log("Video transcript downloaded!")
    } else if (contentType == "Reading") {
        downloadReadingTranscript();
        console.log("Reading transcript downloaded!")
    }
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.msg === "downloadTranscript") {
        updateInfo();
        initDownload();
    }
    sendResponse({ fromcontent: "This message is from content.js" });
});