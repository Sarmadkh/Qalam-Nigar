const proxy = 'https://corsproxy.io/?'; // 
const website = 'https://dailyurducolumns.com/';
const bottomItems = document.querySelectorAll('.bottom-item');
const content = document.querySelector('.content');
const articleList = document.querySelector('.article-list');
const authorListItems = document.querySelectorAll('.author-grid li');
const articleText = document.querySelector('.article-text');
const authorSearchInput = document.getElementById('authorSearchInput');
const topLeft = document.querySelector('.top-left');
const topRight = document.querySelector('.top-right');
const topMiddle = document.querySelector('.top-middle');
const backIcon = document.querySelector('.top-left i.fas.fa-arrow-left');
const barsIcon = document.querySelector('.top-left i.fas.fa-bars');
const menuIcon = document.querySelector('.top-right i.fas.fa-ellipsis-v');
const dateIcon = document.querySelector('.top-right i.far.fa-calendar-alt');
let page = 1;
let selectedAuthor = "";

//Chnage styling for Bottom Menu on click _____________________________________________________________
document.addEventListener('DOMContentLoaded', function() {

    bottomItems[0].classList.add('active');
    bottomItems.forEach(item => {
        item.addEventListener('click', () => {
            bottomItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });
});

//Show/Hide screen when required _____________________________________________________________
document.addEventListener('DOMContentLoaded', function() {
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
            topMiddle.textContent = screenTextMap[screenId] || "Articles";
        });
    });
});

// Function to Scrape Data and store it in an array _____________________________________________________________
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

// Selecting the Author _____________________________________________________________
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
        const authorURL = proxy + website + authorName.replace(/ /g, '-') + "/" + page;
       scrapedData.length = 0;
		 scrapeData(authorURL);
        displayData();
        // Switching to the "Articles" screen
        const articlesMenuItem = document.querySelector('[data-screen="articles"]');
        if (articlesMenuItem) {
            articlesMenuItem.click();
        }
        if (authorSearchInput) {
            authorSearchInput.value = '';
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
		 getNewData(selectedAuthor,page);
		 
    }
});

// Function to format the date as three lines _____________________________________________________________
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

// Function to display the Scraped Data _____________________________________________________________
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

// Function to clear the scraped data _____________________________________________________________
function clearScrapedData() {
    scrapedData.length = 0;
    articleList.innerHTML = '';
}

// Makes sure each item is clickable with correct url _____________________________________________________________
function handleArticleClick(selectedItem) {
    const topAnchor = document.getElementById('top');
    topAnchor.scrollIntoView({ behavior: 'smooth' });

    backIcon.style.display = 'block';
    menuIcon.style.display = 'block';
    barsIcon.style.display = 'none';
    dateIcon.style.display = 'none';

    displayArticleText(selectedItem.url);
	console.log('Selected Article URL:', selectedItem.url);
}

// Attach a single event listener to the articleList
articleList.addEventListener('click', (event) => {
    const listItem = event.target.closest('.list-item');
    if (listItem) {
        const articleURL = listItem.getAttribute('data-url');
        if (articleURL) {
            handleArticleClick({ url: articleURL }); // Pass the URL as an argument
        }
    }
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
            articleList.classList.add('hidden');
        } else {
            articleText.textContent = 'Article text not found.';
            articleText.classList.remove('active');
            articleList.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error fetching article text:', error);
    }
}

// Ensure Back Button is working and switching _____________________________________________________________
document.querySelector('.top-left').addEventListener('click', () => {
    if (articleText.classList.contains('active')) {
        // If article text is active, hide it and show the article list
        articleText.classList.remove('active');
        articleList.classList.remove('hidden');
        backIcon.style.display = 'none';
        menuIcon.style.display = 'none';
        barsIcon.style.display = 'block';
        dateIcon.style.display = 'block';
    }
});

// Search Functionality for Author List _____________________________________________________________
document.addEventListener('DOMContentLoaded', function() {
    const authorList = document.querySelector('.author-list ul.author-grid');
    const authors = authorList.getElementsByTagName('li');

    authorSearchInput.addEventListener('input', function() {
        const searchTerm = authorSearchInput.value.toLowerCase();

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

// Attach a click event listener to the date icon
dateIcon.addEventListener('click', function(event) {
    event.stopPropagation();
    AddCalendarDays(new Date().getFullYear(), new Date().getMonth(), dateIcon);
});

// Call the scrapeData function when the page loads
window.addEventListener('load', scrapeData());
