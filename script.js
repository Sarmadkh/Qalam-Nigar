const proxy = 'https://corsproxy.io/?'; // https://corsproxy.io/?
const website = 'https://dailyurducolumns.com/';
const bottomItems = document.querySelectorAll('.bottom-item-main');
const content = document.querySelector('.content');
const articleList = document.querySelector('.article-list');
const authorListItems = document.querySelectorAll('.author-grid li');
const articleText = document.querySelector('.article-text');
const authorSearch = document.getElementById('authorSearch');
const articleSearch = document.getElementById('articleSearch');
const topBarMain = document.getElementById('top-bar-main');
const bottomBarMain = document.getElementById('bottom-bar-main');
const topBarArticle = document.getElementById('top-bar-article');
const bottomBarArticle = document.getElementById('bottom-bar-article');
const settingsBox = document.querySelector('.text-options-box');
const appInventor = window.AppInventor && window.AppInventor.setWebViewString;
let page = 1;
let selectedAuthor = "";

//Chnage styling for Bottom Menu on click _____________________________________________________________
document.addEventListener('DOMContentLoaded', function () {

    bottomItems[0].classList.add('active');
    bottomItems.forEach(item => {
        item.addEventListener('click', () => {
            bottomItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });
});

//Show/Hide screen when required _____________________________________________________________
document.addEventListener('DOMContentLoaded', function () {
    const screens = document.querySelectorAll('.screen');
    const screenTextMap = {
        articles: "Articles",
        authors: "Authors",
        saved: "Saved Articles",
    };
    // Initially, hide all screens except "Articles"
    screens.forEach(screen => {
        screen.style.display = 'none';
    });
    document.getElementById('articles').style.display = 'block';
    bottomItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            screens.forEach(screen => {
                screen.style.display = 'none';
            });
            // Show the corresponding screen based on the clicked item
            const screenId = bottomItems[index].dataset.screen;
            document.getElementById(screenId).style.display = 'block';
            // Update the top menu text based on the active screen
            document.querySelector('.top-middle').textContent = screenTextMap[screenId] || "Articles";
            // Check if the "Author" screen is clicked and run the backButton function
        });
    });
});

// Function to Scrape Data and store it in an array ____________________________________________________________________________
const scrapedData = [];
scrapedData.length = 0;
async function scrapeData(url = proxy + website + 'LstColumns.aspx') {
    try {
        const response = await fetch(url);
        const html = await response.text();
        const tempElement = document.createElement('div');
        tempElement.innerHTML = html;
        tempElement.querySelectorAll('img').forEach(img => {
            img.removeAttribute('src');
        });
        const articles = Array.from(tempElement.querySelectorAll('article.item-list'));
        // Store the scraped data in the array
        articles.forEach(article => {
            scrapedData.push({
                title: article.querySelector('h2 a').textContent,
                author: article.querySelector('span.post-meta-author a').textContent,
                date: article.querySelector('span.tie-date').textContent,
                url: `${website}${article.querySelector('h2 a').getAttribute('href').replace(/^\//, '')}`,
            });
        });
        displayData();
    } catch (error) {
        console.error('Error:', error);
    }
}

// Selecting the Author ___________________________________________________________________________________________
function handleAuthorSelection(event) {
    event.preventDefault();
    selectedAuthor = event.target.textContent;
    clearScrapedData();
    if (selectedAuthor) {
        page = 1;
        getNewData(selectedAuthor, page);
    } else {
        console.error("Selected author is undefined.");
    }
}

// Attaching Click with Author List
authorListItems.forEach(authorListItem => {
    authorListItem.addEventListener('click', handleAuthorSelection);
});

function getNewData(authorName, page) {
    if (authorName) {
        const authorURL = proxy + website + authorName.replace(/ /g, '-').replace(/\./g, '') + "/" + page;
        scrapedData.length = 0;
        scrapeData(authorURL);
        displayData();
        // Switching to the "Articles" screen
        const articlesMenuItem = document.querySelector('[data-screen="articles"]');
        if (articlesMenuItem) {
            articlesMenuItem.click();
        }
        if (authorSearch) {
            authorSearch.value = '';
        }
        authorListItems.forEach(item => {
            item.style.display = 'block';
        });
    }
}
// Load new data when page reached bottom
content.addEventListener('scroll', function () {
    if (content.scrollTop + content.clientHeight >= content.scrollHeight) {
        page++
        getNewData(selectedAuthor, page);

    }
});

// Function to format the date as three lines ____________________________________________________________________________
function formatDate(inputDate) {
    const dateObj = new Date(inputDate);
    const day = dateObj.getDate();
    const month = dateObj.toLocaleString('default', {
        month: 'short'
    });
    const year = dateObj.getFullYear();

    return `
        <div>${day}</div>
        <div>${month}</div>
        <div>${year}</div>
    `;
}

// Function to display the Scraped Data ____________________________________________________________________________
function displayData() {
    scrapedData.forEach(item => {
        const formattedDate = formatDate(item.date);
        const listItem = document.createElement('div');
        listItem.classList.add('list-item');
        // Set the URL as a data attribute
        listItem.setAttribute('data-url', item.url);
        listItem.innerHTML = `
                    <div class="list-item-left">${formattedDate}</div>
                    <div class="list-item-right">
                        <p><strong>${item.title}</strong></p>
								<p>&nbsp</p>
                        <p style="color: transparent; font-size: 1pt;">${item.url}</p>
                        <p>${item.author}</p>
                    </div>
                `;
        articleList.appendChild(listItem);
        document.getElementById('lottie-sync').style.display = 'none';
    });
}

// Function to clear the scraped data ____________________________________________________________________________
function clearScrapedData() {
    document.getElementById('lottie-sync').style.display = 'block';
    scrapedData.length = 0;
    articleList.innerHTML = '';
}

// Makes sure each item is clickable with correct url _____________________________________________________________
function handleArticleClick(selectedItem) {
    displayArticleText(selectedItem.url);
    const listItem = document.querySelector(`[data-url="${selectedItem.url}"]`);

    if (listItem) {
        const titleElement = listItem.querySelector('.list-item-right p strong');
        if (titleElement) {
            document.getElementById('articleTitle').textContent = titleElement.textContent;
        }
    }
}

// Attach a single event listener to the articleList
articleList.addEventListener('click', (event) => {
    const listItem = event.target.closest('.list-item');
    if (listItem) {
        const articleURL = listItem.getAttribute('data-url');
        if (articleURL) {
            handleArticleClick({ url: articleURL });
        }
    }
    toggleSearchBox();
});

// Function to fetch and display article text _____________________________________________________________
async function displayArticleText(url) {
    try {
        const fullURL = proxy + url;
        const response = await fetch(fullURL);
        const html = await response.text();
        const tempElement = document.createElement('div');
        tempElement.innerHTML = html;
        tempElement.querySelectorAll('img').forEach(img => img.removeAttribute('src'));
        const articleTextElement = tempElement.querySelector('.UrduPost');

        articleText.innerHTML = '';

        if (articleTextElement) {
            articleText.appendChild(articleTextElement);
            articleText.classList.add('active');
            // Set the max-height of .article-text.active to the contentHeight
            document.querySelector('.article-text.active').style.maxHeight = (document.querySelector('.content').offsetHeight - 52) + 'px';
            document.querySelector('.scroll-indicator').style.display = 'block';
            articleList.classList.add('hidden');
            topBarMain.style.top = `-${topBarMain.offsetHeight}px`;
            topBarArticle.style.top = `0`;
            bottomBarMain.style.bottom = `-${bottomBarMain.offsetHeight}px`;
            bottomBarArticle.style.bottom = `0`;
        } else {
            articleText.textContent = 'Article text not found.';
            backButton();
        }
    } catch (error) {
        console.error('Error fetching article text:', error);
    }
}

// Ensure Back Button is working and switching ____________________________________________________________________________
document.querySelector('i.fas.fa-arrow-left').closest('.top-left').addEventListener('click', () => {
    backButton();
});

function backButton() {
    document.querySelector('.article-text.active').style.maxHeight = 0 + 'px';
    articleText.innerHTML = '';
    showBars();
    articleText.classList.remove('active');
    articleList.classList.remove('hidden');
    document.querySelector('.scroll-indicator').style.display = 'none';
    document.querySelector('.scroll-progress').style.width = '0%';
    topBarMain.style.top = '0'
    topBarArticle.style.top = `-${topBarArticle.offsetHeight}px`;
    bottomBarMain.style.bottom = '0';
    bottomBarArticle.style.bottom = `-${bottomBarArticle.offsetHeight}px`;
}

// Search Functionality ______________________________________________________________________________________________________
// Search Functionality for Author List
document.addEventListener('DOMContentLoaded', function () {
    const authorList = document.querySelector('.author-list ul.author-grid');
    const authors = authorList.getElementsByTagName('li');

    authorSearch.addEventListener('input', function () {
        const searchTerm = authorSearch.value.toLowerCase();

        for (let i = 0; i < authors.length; i++) {
            const authorName = authors[i].textContent.toLowerCase();
            if (authorName.includes(searchTerm)) {
                authors[i].style.display = 'block';
            } else {
                authors[i].style.display = 'none';
            }
        }
    });
});

// Search Functionality for Article List
document.addEventListener('DOMContentLoaded', function () {
    if (articleSearch) {
        articleSearch.addEventListener('input', function () {
            const searchTerm = articleSearch.value.toLowerCase();
            const articles = document.querySelectorAll('.list-item');
            articles.forEach(article => {
                const titleElement = article.querySelector('.list-item-right p strong');
                if (titleElement) {
                    const title = titleElement.textContent.toLowerCase();
                    const isMatch = title.includes(searchTerm);
                    // Show or hide the article based on the search result
                    if (isMatch) {
                        article.style.display = 'flex';
                    } else {
                        article.style.display = 'none';
                    }
                }
            });
        });
    }
});

// Function to toggle the display of all search boxes
function toggleSearchBox() {
    const searchBox = document.querySelectorAll('.search-box');
    searchBox.forEach(searchBox => {
        if (searchBox.style.display === 'none' || searchBox.style.display === '') {
            searchBox.style.display = 'block';
            const searchInput = searchBox.querySelector('input[type="text"]');
            if (searchInput) {
                searchInput.focus();
            }
        } else {
            searchBox.style.display = 'none';
            [articleSearch, authorSearch].forEach(searchInput => {
                searchInput.value = '';
                searchInput.dispatchEvent(new Event('input', { bubbles: true }));
            });
        }
    });
}

document.querySelector('i.fas.fa-search').closest('.top-right').addEventListener('click', toggleSearchBox);
document.addEventListener('click', function (event) {
    const searchBox = document.querySelector('.search-box');
    if (searchBox.style.display === 'block' && !searchBox.contains(event.target) && event.target !== document.querySelector('i.fas.fa-search')) {
        toggleSearchBox();
    }
});

// Show/Hide the calender _____________________________________________________________________________________________
const dateIcon = document.querySelector('i.far.fa-calendar-alt').closest('.top-left');
dateIcon.addEventListener('click', function (event) {
    event.stopPropagation();
    AddCalendarDays(new Date().getFullYear(), new Date().getMonth(), dateIcon);
});

//Show/Hide the Text Options in Article Text Screen _____________________________________________________________
let isSettingsBoxVisible = false;
document.querySelector('i.fas.fa-sliders-h').closest('.bottom-item-article').addEventListener('click', (event) => {
    event.stopPropagation();
    if (isSettingsBoxVisible) {
        hideSettingsBox();
    } else {
        showSettingsBox();
    }
});
document.addEventListener('click', (event) => {
    if (isSettingsBoxVisible && !settingsBox.contains(event.target)) {
        hideSettingsBox();
    }
});
function showSettingsBox() {
    settingsBox.style.display = 'block';
    settingsBox.style.bottom = '50px';
    isSettingsBoxVisible = true;
}
function hideSettingsBox() {
    settingsBox.style.bottom = '-275px';
    isSettingsBoxVisible = false;
}

// Saving and Loading the Text Options _____________________________________________________________________________________________
const textSizeSlider = document.getElementById('textSize');
const lineHeightSlider = document.getElementById('lineHeight');
const alignmentButtons = document.querySelectorAll('.text-icon-button');
// Load saved settings when the page loads
window.addEventListener('load', () => {
    // Load and apply the saved settings, or use default values if not saved
    let savedTextSize;
    let savedLineHeight;
    let savedAlignment;
    
    if (appInventor) {
        const values = window.AppInventor.getWebViewString().split(',');
        // Load and apply the saved settings, or use default values if not saved
        savedTextSize = values[0] || '20';
        savedLineHeight = values[1] || '2';
        savedAlignment = values[2] || 'justify';
    } else {
        // If AppInventor functions are not available, use local storage or default values
        savedTextSize = localStorage.getItem('textSize') || '20';
        savedLineHeight = localStorage.getItem('lineHeight') || '2';
        savedAlignment = localStorage.getItem('alignment') || 'justify';
    }
    
    // Apply the loaded settings
    textSizeSlider.value = savedTextSize;
    articleText.style.fontSize = `${savedTextSize}px`;
    lineHeightSlider.value = savedLineHeight;
    articleText.style.lineHeight = savedLineHeight;

    alignmentButtons.forEach(button => {
        button.classList.remove('text-icon-button-active');
        if (button.id === savedAlignment) {
            button.classList.add('text-icon-button-active');
            articleText.style.textAlign = savedAlignment;
        }
    });
});

textSizeSlider.addEventListener('input', () => {
    const textSize = `${textSizeSlider.value}px`;
    articleText.style.fontSize = textSize;
    if (appInventor) { window.AppInventor.setWebViewString('textSize: ' + textSizeSlider.value); }
    localStorage.setItem('textSize', textSizeSlider.value);
});

lineHeightSlider.addEventListener('input', () => {
    const lineHeight = lineHeightSlider.value;
    articleText.style.lineHeight = lineHeight;
    if (appInventor) { window.AppInventor.setWebViewString('lineHeight: ' + lineHeight); }
    localStorage.setItem('lineHeight', lineHeight);
});

alignmentButtons.forEach(button => {
    button.addEventListener('click', () => {
        const alignment = button.id;
        articleText.style.textAlign = alignment;
        alignmentButtons.forEach(btn => btn.classList.remove('text-icon-button-active'));
        button.classList.add('text-icon-button-active');
        if (appInventor) { window.AppInventor.setWebViewString('alignment: ' + alignment); }
        localStorage.setItem('alignment', alignment);
    });
});

// Auto Scroll Feature __________________________________________________________________________________________________________________________
const scrollSpeed = document.getElementById('scrollSpeed');
let scrollInterval = null;

scrollSpeed.addEventListener('input', () => {
    const speed = parseInt(scrollSpeed.value, 10);
    if (speed > 0) {
        startScroll(speed);
    } else {
        stopScroll();
    }
});

function startScroll(speed) {
    if (speed > 0) {
        stopScroll(); // Stop any ongoing scroll
        // Adjust the scrollStep value to change the scrolling speed
        if (appInventor) { window.AppInventor.setWebViewString(`Full Screen`); }
        const scrollStep = speed;
        const intervalDelay = 50; // Increase this value for slower scrolling
        scrollInterval = setInterval(() => {
            articleText.scrollTop += scrollStep;
            // Set the slider back to 0 when scrolling reaches the end
            if (articleText.scrollTop >= articleText.scrollHeight - articleText.clientHeight) {
                stopScroll();
                scrollSpeed.value = 0;
            }
        }, intervalDelay);
    } else {
        stopScroll();
    }
}

function stopScroll() {
    clearInterval(scrollInterval);
    if (appInventor) { window.AppInventor.setWebViewString(`Exit Screen`); }
}

// Share Feature __________________________________________________________________________________________________________________________
document.querySelector('i.fas.fa-share-alt').closest('.bottom-item-article').addEventListener('click', () => {
    const articleTitle = document.getElementById('articleTitle');
    const sharedText = 'Try Qaalim' + '\n\n' + `${articleTitle.textContent}\n\n${articleText.textContent}`
    if (articleTitle && articleText && window.AppInventor && window.AppInventor.setWebViewString) {
        // Use window.AppInventor.setWebViewString if available
        window.AppInventor.setWebViewString(sharedText);
    } else if (navigator.share) {
        // Use Web Share API as a fallback
        navigator.share({
            title: 'Share Article',
            text: sharedText,
        })
            .then(() => console.log('Shared successfully'))
            .catch(error => console.error('Share error:', error));
    } else {
        alert('Please Use Any Latest Browser');
    }
});

// Full Screen Feature __________________________________________________________________________________________________________________________
document.querySelector('i.fas.fa-expand').closest('.top-right').addEventListener('click', () => {
    hideBars();
});
document.querySelector('i.fas.fa-compress').closest('.minimize-button').addEventListener('click', () => {
    showBars();
});

function hideBars() {
    topBarArticle.style.display = 'none';
    bottomBarArticle.style.display = 'none';
    document.querySelector('.content').style.position = 'initial'
    document.querySelector('.article-text.active').style.maxHeight = (window.innerHeight - 42) + 'px';
    document.querySelector('.minimize-button').style.display = 'flex';
    if (appInventor) { window.AppInventor.setWebViewString(`Full Screen`); }
}
function showBars() {
    topBarArticle.style.display = 'flex';
    bottomBarArticle.style.display = 'flex';
    document.querySelector('.content').style.position = 'fixed'
    document.querySelector('.article-text.active').style.maxHeight = (document.querySelector('.content').offsetHeight - 52) + 'px';
    document.querySelector('.minimize-button').style.display = 'none';
    if (appInventor) { window.AppInventor.setWebViewString(`Exit Screen`); }
}

// Progress Bar Feature __________________________________________________________________________________________________________________________
articleText.addEventListener('scroll', () => {
    document.querySelector('.scroll-progress').style.width = (articleText.scrollTop / (articleText.scrollHeight - articleText.clientHeight)) * 100 + `%`;
});


// Lottie Animation __________________________________________________________________________________________________________________________
function offlineMode() {
    document.getElementById('lottie-offline').style.display = 'block';
    clearScrapedData();
    document.getElementById('lottie-sync').style.display = 'none';
}

function onlineMode() {
    document.getElementById('lottie-offline').style.display = 'none';
    clearScrapedData();
    scrapeData();
}

lottie.loadAnimation({
    container: document.getElementById('lottie-empty'),
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: 'empty.json'
});

lottie.loadAnimation({
    container: document.getElementById('lottie-sync'),
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: 'sync.json'
});

lottie.loadAnimation({
    container: document.getElementById('lottie-offline'),
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: 'offline.json'
});


// Call the scrapeData function when the page loads
window.addEventListener('load', scrapeData());
