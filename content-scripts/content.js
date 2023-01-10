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
        tempLink.setAttribute('download', courseTitle + " " + courseModuleNumber + "." + sectionIndex + "." + sidebarIndex + sectionTitle + " #" + pageTitle + " [" + contentType + "] " + ".txt");
        document.body.appendChild(tempLink);
        tempLink.click();
        document.body.removeChild(tempLink);
    });
}

function downloadReadingTranscript() {
    // Download the instructions of the reading page itself. Usually redundant, but not always!
    let mainDiv = document.querySelector('div[data-testid="cml-viewer"]') // Div that stores <p>, <ol>, <ul>
    let mainDivNodes = mainDiv.childNodes

    let aestheticDivider = ''
    for (i = 0; i < pageTitle.length; i++) {
        aestheticDivider += '_'
    }

    let mainTextContent = pageTitle + '\n' + aestheticDivider + '\n\n'; // Start the file with the page's title
    
    for (const child of mainDivNodes) { 
        let indent = '' // default of no indent
        if (child.tagName === 'UL') {
            indent = '  * '; // 4 spaces
            for (let i = 0; i < child.children.length; i++) {
                mainTextContent += indent + child.children[i].innerText + '\n';
            }
        }
        else if (child.tagName === 'OL') {
            indent = '  ' // 2 spaces for addition of index
            for (let i = 0; i < child.children.length; i++) {
                mainTextContent += indent + ( i + 1)  + ". " + child.children[i].innerText + '\n';
            }
        }
        else if (child.tagName === 'P') {
            mainTextContent += child.innerText + '\n';
        }
        else if (child.tagName === 'DIV') {
            let assetName = (child.querySelector('div[data-e2e="asset-name"]')).innerText
            let assetLabel = (child.querySelector('div[data-e2e="asset-label"]')).innerText
            indent = '  '
            mainTextContent += indent + assetLabel + ': ' + indent + assetName + '\n';
        }
    }

    // Create a blob to download the page's instructions
    const readingBlob = new Blob([mainTextContent], { type: 'text/plain'})
    const readingBlobAnchor = document.createElement('a');
    readingBlobAnchor.href = URL.createObjectURL(readingBlob)
    readingBlobAnchor.download = courseTitle + " " + courseModuleNumber + "." + sectionIndex + "." + sidebarIndex + " " + sectionTitle + " #" + pageTitle + " [Reading]." + "txt";
    document.body.appendChild(readingBlobAnchor);
    readingBlobAnchor.click()
    document.body.removeChild(readingBlobAnchor)


    // Find downloads area
    let assetLinks = document.querySelectorAll(".cml-asset")

    // Loop through all the DLC for downloading
    for (let i = 0; i < assetLinks.length; i++) {
        let assetFileExtension = assetLinks[i].getAttribute('data-extension')
        let assetFilename = assetLinks[i].getAttribute('data-name').replace("." + assetFileExtension, "");
        let assetHref = assetLinks[i].getAttribute('data-url');

        // Download the files shown on the page
        fetch(assetHref)
        .then(response => response.blob())
        .then(blob => {
            let tempLink = document.createElement('a');
            tempLink.style.display = 'none';
            tempLink.href = URL.createObjectURL(blob);
            tempLink.setAttribute('download', courseTitle + " " + courseModuleNumber + "." + sectionIndex + "." + sidebarIndex + " " + sectionTitle + " #" + assetFilename + " [Reading File]." + assetFileExtension );
            document.body.appendChild(tempLink);
            tempLink.click();
            document.body.removeChild(tempLink);
        });
    }
}

function downloadQuizMetadata () {
    // Create a blob to download the page's instructions
    const quizBlob = new Blob([pageTitle], { type: 'text/plain'})
    const quizBlobAnchor = document.createElement('a');
    quizBlobAnchor.href = URL.createObjectURL(quizBlob)
    quizBlobAnchor.download = courseTitle + " " + courseModuleNumber + "." + sectionIndex + "." + sidebarIndex + " " + sectionTitle + " #" + pageTitle + " [Quiz]." + "txt";
    document.body.appendChild(quizBlobAnchor);
    quizBlobAnchor.click()
    document.body.removeChild(quizBlobAnchor)
}

function initDownload() {
    if (contentType == "Video") {
        downloadVideoTranscript();
        console.log("Video transcript downloaded!")
    } else if (contentType == "Reading") {
        downloadReadingTranscript();
        console.log("Reading transcript downloaded!")
    } else if (contentType == "Quiz") {
        downloadQuizMetadata();
    }
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.msg === "downloadTranscript") {
        updateInfo();
        initDownload();
    }
    sendResponse({ fromcontent: "This message is from content.js" });
});