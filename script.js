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
const dateIcon = document.querySelector('i.far.fa-calendar-alt').closest('.top-left');
const settingsBox = document.querySelector('.text-options-box');
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
    });
}

// Function to clear the scraped data ____________________________________________________________________________
function clearScrapedData() {
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
            document.querySelector('.article-text.active').style.maxHeight = (document.querySelector('.content').offsetHeight - 52)  + 'px';
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
    document.querySelector('.article-text.active').style.maxHeight = 0  + 'px';
    articleText.innerHTML = '';
    articleText.classList.remove('active');
    articleList.classList.remove('hidden');
    document.querySelector('.scroll-indicator').style.display = 'none';
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
// Changing article text based on selected option
const textSizeSlider = document.getElementById('textSize');
const lineHeightSlider = document.getElementById('lineHeight');
const alignmentButtons = document.querySelectorAll('.text-icon-button');
// Load saved settings when the page loads
window.addEventListener('load', () => {
    // Load and apply the saved settings, or use default values if not saved
    const savedTextSize = localStorage.getItem('textSize') || '20';
    const savedLineHeight = localStorage.getItem('lineHeight') || '2';
    const savedAlignment = localStorage.getItem('alignment') || 'justify';
    // Apply the loaded settings
    textSizeSlider.value = savedTextSize;
    document.querySelector('.article-text').style.fontSize = `${savedTextSize}px`;

    lineHeightSlider.value = savedLineHeight;
    document.querySelector('.article-text').style.lineHeight = savedLineHeight;

    alignmentButtons.forEach(button => {
        button.classList.remove('text-icon-button-active');
        if (button.id === savedAlignment) {
            button.classList.add('text-icon-button-active');
            document.querySelector('.article-text').style.textAlign = savedAlignment;
        }
    });
});

textSizeSlider.addEventListener('input', () => {
    const textSize = `${textSizeSlider.value}px`;
    document.querySelector('.article-text').style.fontSize = textSize;
    localStorage.setItem('textSize', textSizeSlider.value);
});

lineHeightSlider.addEventListener('input', () => {
    const lineHeight = lineHeightSlider.value;
    document.querySelector('.article-text').style.lineHeight = lineHeight;
    localStorage.setItem('lineHeight', lineHeight);
});

alignmentButtons.forEach(button => {
    button.addEventListener('click', () => {
        const alignment = button.id;
        document.querySelector('.article-text').style.textAlign = alignment;
        localStorage.setItem('alignment', alignment);
        alignmentButtons.forEach(btn => btn.classList.remove('text-icon-button-active'));
        button.classList.add('text-icon-button-active');
    });
});

// Auto Scroll Feature __________________________________________________________________________________________________________________________
const scrollSpeed = document.getElementById('scrollSpeed');
let scrollInterval = null;
let wakeLock = null; // Initialize wake lock variable

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
        // Request a wake lock to keep the screen on
        if ('wakeLock' in navigator) {
            navigator.wakeLock.request('screen').then((lock) => {
                wakeLock = lock;
            }).catch((error) => {
                alert('Keep Scree On Not Supported');
            });
        }
        
        stopScroll(); // Stop any ongoing scroll
        // Adjust the scrollStep value to change the scrolling speed
        const scrollStep = speed;
        const intervalDelay = 50; // Increase this value for slower scrolling
        scrollInterval = setInterval(() => {
            articleText.scrollTop += scrollStep;
            if (articleText.scrollTop >= articleText.scrollHeight - articleText.clientHeight) {
                stopScroll();
                // Set the slider back to 0 when scrolling reaches the end
                scrollSpeed.value = 0;
            }
        }, intervalDelay);
    } else {
        stopScroll();
    }
}

function stopScroll() {
    clearInterval(scrollInterval);
    // Release the wake lock when scrolling stops
    if (wakeLock) {
        wakeLock.release();
        wakeLock = null;
    }
}

// Share Feature __________________________________________________________________________________________________________________________
document.querySelector('i.fas.fa-share-alt').closest('.bottom-item-article').addEventListener('click', () => {
    // Get the title and text elements
    const articleTitle = document.getElementById('articleTitle');
    if (articleTitle && articleText) {
        // Check if the Web Share API is available
        if (navigator.share) {
            navigator.share({
                title: 'Share Article',
                text: `${articleTitle.textContent}\n\n${articleText.textContent}`,
            })
                .then(() => console.log('Shared successfully'))
                .catch(error => console.error('Share error:', error));
        } else {
            alert('Please Use Any Latest Browser');
        }
    } else {
        console.error('Title or text elements not found.');
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
        document.querySelector('.article-text.active').style.maxHeight = (window.innerHeight - 42)  + 'px';
        document.querySelector('.minimize-button').style.display = 'flex';
}
function showBars() {
        topBarArticle.style.display = 'flex';
        bottomBarArticle.style.display = 'flex';
        document.querySelector('.content').style.position = 'fixed'
        document.querySelector('.article-text.active').style.maxHeight = (document.querySelector('.content').offsetHeight - 52)  + 'px';
        document.querySelector('.minimize-button').style.display = 'none';
}

// Progress Bar Feature __________________________________________________________________________________________________________________________
articleText.addEventListener('scroll', () => {
    document.querySelector('.scroll-progress').style.width = (articleText.scrollTop / (articleText.scrollHeight - articleText.clientHeight)) * 100 + `%`;
});

// Call the scrapeData function when the page loads
window.addEventListener('load', scrapeData());
