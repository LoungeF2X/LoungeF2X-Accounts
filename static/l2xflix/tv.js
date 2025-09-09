const apiKey = '00119ffd2d069c15532a335d74664364';
const tvGrid = document.getElementById('tv-grid');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const tvPopup = document.getElementById('tv-popup');
const loadingIndicator = document.getElementById('loading-indicator');
const seasonsOrEpisodes = document.getElementById('seasons-or-episodes');
let page = 1;
let searching = false;
let searchQuery = '';
let currentTVId;
const popupCloseButton = document.getElementById('popup-close-button');

async function fetchTVShows(url) {
    loadingIndicator.style.display = 'block';
    try {
        const response = await fetch(url);
        const data = await response.json();
        loadingIndicator.style.display = 'none';
        return data.results;
    } catch (error) {
        console.error('Error fetching TV shows:', error);
        loadingIndicator.style.display = 'none';
        return [];
    }
}

async function fetchTrendingTVShows() {
    const url = `https://api.themoviedb.org/3/trending/tv/week?api_key=${apiKey}&page=${page}`;
    const tvShows = await fetchTVShows(url);
    displayTVShows(tvShows);
    page++;
}

async function searchTVShows(query) {
    const url = `https://api.themoviedb.org/3/search/tv?api_key=${apiKey}&query=${query}&page=${page}`;
    const tvShows = await fetchTVShows(url);
    displayTVShows(tvShows);
    page++;
}

async function fetchSeasons(tvId) {
    const url = `https://api.themoviedb.org/3/tv/${tvId}?api_key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.seasons;
}

async function fetchEpisodes(tvId, seasonNumber) {
    const url = `https://api.themoviedb.org/3/tv/${tvId}/season/${seasonNumber}?api_key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.episodes;
}

function displayTVShows(tvShows) {
    tvShows.forEach(tvShow => {
        const tvCard = document.createElement('div');
        tvCard.classList.add('tv-card');

        const imageUrl = `https://image.tmdb.org/t/p/w500/${tvShow.poster_path}`;
        const description = tvShow.overview;

        tvCard.innerHTML = `
            <img src="${imageUrl}" alt="${tvShow.name}">
            <div class="tv-info">
                <h2>${tvShow.name}</h2>
                <p>${description}</p>
            </div>
            <div class="play-button"><i class="bi bi-play-circle-fill"></i></div>
        `;
        tvCard.addEventListener('click', async () => {
            currentTVId = tvShow.id;
            tvPopup.style.display = 'block';
            const seasons = await fetchSeasons(tvShow.id);
            displaySeasons(seasons);
        });
        tvGrid.appendChild(tvCard);
    });
}

function displaySeasons(seasons) {
    seasonsOrEpisodes.innerHTML = '<h3>Seasons</h3>';
    const seasonList = document.createElement('ul');
    seasonList.classList.add('season-list');
    seasons.forEach(season => {
        const seasonItem = document.createElement('li');
        seasonItem.textContent = `Season ${season.season_number - 1}`;
        seasonItem.addEventListener('click', async () => {
            const episodes = await fetchEpisodes(currentTVId, season.season_number);
            displayEpisodes(episodes);
        });
        seasonList.appendChild(seasonItem);
    });
    seasonsOrEpisodes.appendChild(seasonList);
}

function displayEpisodes(episodes) {
    seasonsOrEpisodes.innerHTML = '<h3>Episodes</h3>';
    const episodeList = document.createElement('ul');
    episodeList.classList.add('episode-list');
    episodes.forEach(episode => {
        const episodeItem = document.createElement('li');
        episodeItem.textContent = `Episode ${episode.episode_number}: ${episode.name}`;
        episodeItem.addEventListener('click', () => {
            let embedUrl = `https://vidsrc.su/embed/tv/${currentTVId}/${episode.season_number}/${episode.episode_number}`;
            seasonsOrEpisodes.innerHTML = `<iframe width="100%" height="200px" src="${embedUrl}" frameborder="0" allowfullscreen></iframe>`;
        });
        episodeList.appendChild(episodeItem);
    });
    seasonsOrEpisodes.appendChild(episodeList);
}

function handleScroll() {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
        if (searching) {
            searchTVShows(searchQuery);
        } else {
            fetchTrendingTVShows();
        }
    }
}

fetchTrendingTVShows();

searchButton.addEventListener('click', () => {
    page = 1;
    tvGrid.innerHTML = '';
    searchQuery = searchInput.value.trim();
    if (searchQuery) {
        searching = true;
        searchTVShows(searchQuery);
    } else {
        searching = false;
        fetchTrendingTVShows();
    }
});

searchInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        searchButton.click();
    }
});

popupCloseButton.addEventListener('click', () => {
    tvPopup.style.display = 'none';
    seasonsOrEpisodes.innerHTML = '';
});

window.addEventListener('scroll', handleScroll);
