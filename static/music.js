const YT_KEY = AIzaSyCIjc7ZxQ9ePbQ8ikjKshXH6ffakxJC_0o;
const SEARCH_EP = "https://itunes.apple.com/search?term=";
const searchInput = document.querySelector("#searchInput");
const searchResults = document.querySelector("#searchResults");
const trackTitle = document.querySelector("#trackTitle");
const artistName = document.querySelector("#artistName");
const albumCover = document.querySelector("#albumCover");
const musicIcon = document.querySelector("#musicIcon");
const playPauseBtn = document.querySelector("#playPause");
const volumeBtn = document.querySelector("#volumeBtn");
const seekBar = document.querySelector("#seekbar");
const progressBar = document.querySelector("#progress");
const currentTimeSpan = document.querySelector("#currentTime");
const remainingTimeSpan = document.querySelector("#remainingTime");
const lyricsToggle = document.querySelector("#lyrics-toggle");
const playerInfo = document.querySelector("#playerInfo");
const lyricsInfo = document.querySelector("#lyricsInfo");
const lyricsContent = document.querySelector("#lyricsContent");
const favoriteBtn = document.querySelector("#favoriteBtn");
const favoritesColumn = document.querySelector("#favoritesColumn");
const playFavoritesBtn = document.querySelector("#playFavoritesBtn");
let showingLyrics = false;
let isMuted = false;
let player = null;
let isPlaying = false;
let isDragging = false;
let searchTimeout;
let playerReady = false;
let currentTrack = { title: "Not Playing", artist: "", artwork: "", genre: "" };
let isFavorite = false;
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
let currentFavoriteIndex = -1;
async function loadYouTubeAPI(retries = 3, delay = 2000) {
  return new Promise((resolve, reject) => {
    if (window.YT && window.YT.Player) {
      resolve();
      return;
    }
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    tag.onerror = () => {
      if (retries > 0) {
        setTimeout(() => loadYouTubeAPI(retries - 1, delay), delay);
      } else {
        reject(new Error("Failed to load YouTube API"));
      }
    };
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    window.onYouTubeIframeAPIReady = () => resolve();
  });
}
async function initPlayer() {
  try {
    await loadYouTubeAPI();
    player = new window.YT.Player("ytPlayer", {
      height: "1",
      width: "1",
      videoId: "",
      host: "https://www.youtube-nocookie.com",
      playerVars: {
        playsinline: 1,
        enablejsapi: 1,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        autoplay: 0,
      },
      events: {
        onReady: () => {
          playerReady = true;
          playPauseBtn.addEventListener("click", togglePlayback);
          volumeBtn.addEventListener("click", toggleMute);
          seekBar.addEventListener("mousedown", startSeek);
          document.addEventListener("mousemove", dragSeek);
          document.addEventListener("mouseup", endSeek);
          setInterval(updateProgress, 500);
          if (favorites.length > 0) {
            const lastPlayed = JSON.parse(localStorage.getItem("lastPlayed"));
            if (lastPlayed) {
              playSong(
                lastPlayed.title,
                lastPlayed.artist,
                lastPlayed.artwork,
                lastPlayed.genre,
              );
            }
          }
        },
        onStateChange: (event) => {
          if (event.data === window.YT.PlayerState.PLAYING) {
            isPlaying = true;
            playPauseBtn.classList.remove("fa-play");
            playPauseBtn.classList.add("fa-pause");
          } else if (
            event.data === window.YT.PlayerState.PAUSED ||
            event.data === window.YT.PlayerState.ENDED
          ) {
            isPlaying = false;
            playPauseBtn.classList.remove("fa-pause");
            playPauseBtn.classList.add("fa-play");
          }
          if (event.data === window.YT.PlayerState.ENDED && isLooping) {
            player.seekTo(0);
            player.playVideo();
          } else if (
            event.data === window.YT.PlayerState.ENDED &&
            currentFavoriteIndex >= 0 &&
            currentFavoriteIndex < favorites.length - 1
          ) {
            playNextFavorite();
          }
        },
        onError: (event) => {
          searchResults.innerHTML =
            '<div class="error-message">Failed to load video. Please try another song.</div>';
        },
      },
    });
  } catch (error) {
    searchResults.innerHTML =
      '<div class="error-message">Unable to initialize player. Please refresh the page.</div>';
  }
}
function toggleMute() {
  if (!player || !playerReady) return;
  if (isMuted) {
    player.unMute();
    volumeBtn.className = "fa-solid fa-volume-high control-btn";
    isMuted = false;
  } else {
    player.mute();
    volumeBtn.className = "fa-solid fa-volume-xmark control-btn";
    isMuted = true;
  }
}
searchInput.addEventListener("input", function () {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    const query = searchInput.value.trim();
    if (query.length > 1) {
      searchSongs(query);
    } else {
      hideSearchResults();
    }
  }, 500);
});
searchInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    clearTimeout(searchTimeout);
    const query = searchInput.value.trim();
    if (query.length > 1) {
      searchSongs(query);
    }
  }
});
async function searchSongs(query) {
  searchResults.innerHTML = '<div class="loading">Searching...</div>';
  showSearchResults();
  const url = `${SEARCH_EP}${encodeURIComponent(query)}&media=music&limit=10`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    displaySearchResults(data.results);
  } catch (error) {
    searchResults.innerHTML =
      '<div class="error-message">Search failed. Please try again.</div>';
  }
}
function displaySearchResults(results) {
  if (!results || results.length === 0) {
    searchResults.innerHTML = '<div class="loading">No results found</div>';
    return;
  }
  searchResults.innerHTML = "";
  results.forEach((item) => {
    if (!item.trackName || !item.artistName) return;
    const resultElement = document.createElement("div");
    resultElement.className = "result-item";
    resultElement.innerHTML = `
<div class="result-img">
<img src="${item.artworkUrl100}" alt="${item.trackName}" crossorigin="anonymous">
</div>
<div class="result-info">
<div class="result-title">${item.trackName}</div>
<div class="result-artist">${item.artistName}</div>
</div>
`;
    resultElement.addEventListener("click", () => {
      playSong(
        item.trackName,
        item.artistName,
        item.artworkUrl100,
        item.primaryGenreName,
      );
      hideSearchResults();
      searchInput.value = "";
      currentFavoriteIndex = -1;
    });
    searchResults.appendChild(resultElement);
  });
}
function showSearchResults() {
  searchResults.classList.add("active");
}
function hideSearchResults() {
  searchResults.classList.remove("active");
}
function playSong(title, artist, artwork, genre = "") {
  trackTitle.textContent = title;
  artistName.textContent = artist;
  albumCover.src = artwork.replace("100x100", "600x600");
  albumCover.style.display = "block";
  musicIcon.style.display = "none";
  if (showingLyrics) {
    fetchLyrics(artist, title);
  }
  currentTrack = { title, artist, artwork, genre };
  localStorage.setItem("lastPlayed", JSON.stringify(currentTrack));
  isFavorite = favorites.some(
    (fav) => fav.title === title && fav.artist === artist,
  );
  favoriteBtn.className = isFavorite
    ? "fa-solid fa-heart control-btn"
    : "fa-regular fa-heart control-btn";
  const searchQuery = `${title} ${artist}`;
  getYT(searchQuery);
}
function getYT(query) {
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&key=${YT_KEY}&type=video&maxResults=1`;
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      if (data.items && data.items.length > 0) {
        const videoId = data.items[0].id.videoId;
        loadVid(videoId);
      } else {
        searchResults.innerHTML =
          '<div class="error-message">No YouTube results found</div>';
      }
    })
    .catch((error) => {
      searchResults.innerHTML =
        '<div class="error-message">Failed to search YouTube. Please try again.</div>';
    });
}
function loadVid(videoId) {
  if (player && playerReady && player.loadVideoById) {
    player.loadVideoById(videoId);
    setTimeout(() => {
      if (!isMuted) player.unMute();
      player.playVideo();
    }, 100);
  } else {
    initPlayer().then(() => {
      if (player && playerReady && player.loadVideoById) {
        player.loadVideoById(videoId);
        setTimeout(() => {
          if (!isMuted) player.unMute();
          player.playVideo();
        }, 100);
      } else {
        searchResults.innerHTML =
          '<div class="error-message">Unable to initialize player. Please refresh the page.</div>';
      }
    });
  }
}
lyricsToggle.addEventListener("click", function () {
  showingLyrics = !showingLyrics;
  if (showingLyrics) {
    playerInfo.style.display = "none";
    albumCover.style.display = "none";
    musicIcon.style.display = "none";
    lyricsInfo.style.display = "flex";
    fetchLyrics(currentTrack.artist, currentTrack.title);
    lyricsToggle.innerHTML = '<i class="fa-solid fa-align-left"></i>';
  } else {
    playerInfo.style.display = "flex";
    albumCover.style.display =
      currentTrack.title === "Not Playing" ? "none" : "block";
    musicIcon.style.display =
      currentTrack.title === "Not Playing" ? "block" : "none";
    lyricsInfo.style.display = "none";
    lyricsToggle.innerHTML = '<i class="fa-solid fa-align-left"></i>';
  }
});
async function fetchLyrics(artist, title) {
  lyricsContent.textContent = "Loading lyrics...";
  const cleanArtist = encodeURIComponent(artist.trim());
  const cleanTitle = encodeURIComponent(title.trim());
  try {
    const response = await fetch(
      `https://lrclib.net/api/get?artist_name=${cleanArtist}&track_name=${cleanTitle}`,
    );
    if (!response.ok) throw new Error("Lyrics not found");
    const data = await response.json();
    if (data.syncedLyrics) {
      const lines = data.syncedLyrics
        .trim()
        .split("\n")
        .map((line) => {
          const match = line.match(/^\[(\d+):(\d+\.\d+)](.*)$/);
          if (match) {
            const time = parseInt(match[1], 10) * 60 + parseFloat(match[2]);
            const text = match[3].trim();
            return { time, text };
          }
          return null;
        })
        .filter(Boolean);
      lyricsContent.innerHTML = lines
        .map(
          (line, index) =>
            `<div class="lyric-line" data-time="${line.time}" id="lyric-${index}">${line.text}</div>`,
        )
        .join("");
      if (window.lyricsSyncInterval) clearInterval(window.lyricsSyncInterval);
      window.lyricsSyncInterval = setInterval(() => {
        const currentTime =
          player && playerReady && player.getCurrentTime
            ? player.getCurrentTime()
            : 0;
        let activeIndex = -1;
        for (let i = 0; i < lines.length; i++) {
          if (currentTime >= lines[i].time) {
            activeIndex = i;
          } else {
            break;
          }
        }
        document.querySelectorAll(".lyric-line").forEach((el, i) => {
          el.classList.remove("active", "prev", "next");
          if (i === activeIndex) {
            el.classList.add("active");
            lyricsContent.scrollTo({
              top:
                el.offsetTop -
                lyricsContent.clientHeight / 2 +
                el.clientHeight / 2,
              behavior: "smooth",
            });
          } else if (i === activeIndex - 1) {
            el.classList.add("prev");
          } else if (i === activeIndex + 1) {
            el.classList.add("next");
          }
        });
      }, 300);
    } else if (data.lyrics) {
      const formattedLyrics = data.lyrics.replace(/\n/g, "<br>");
      lyricsContent.innerHTML = formattedLyrics;
    } else {
      lyricsContent.textContent = "No lyrics available.";
    }
  } catch (error) {
    lyricsContent.textContent = "No lyrics available.";
  }
}
function togglePlayback() {
  if (!player || !playerReady) return;
  if (isPlaying) {
    player.pauseVideo();
  } else {
    player.playVideo();
  }
}
function startSeek(e) {
  if (!player || !playerReady) return;
  isDragging = true;
  seekBar.classList.add("active");
  updateSeekPosition(e);
}
function dragSeek(e) {
  if (isDragging) updateSeekPosition(e);
}
function endSeek() {
  if (isDragging) {
    isDragging = false;
    seekBar.classList.remove("active");
  }
}
function updateSeekPosition(e) {
  if (!player || !playerReady || !player.getDuration) return;
  const rect = seekBar.getBoundingClientRect();
  const position = (e.clientX - rect.left) / rect.width;
  const percent = Math.min(Math.max(position, 0), 1);
  progressBar.style.width = percent * 100 + "%";
  const duration = player.getDuration();
  player.seekTo(percent * duration, true);
}
function updateProgress() {
  if (!player || !playerReady || !player.getDuration || isDragging) return;
  try {
    const duration = player.getDuration() || 0;
    const currentTime = player.getCurrentTime() || 0;
    const percent = (currentTime / duration) * 100;
    progressBar.style.width = percent + "%";
    currentTimeSpan.textContent = formatTime(currentTime);
    remainingTimeSpan.textContent = "-" + formatTime(duration - currentTime);
  } catch (error) {}
}
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${secs}`;
}
document.addEventListener("click", function (e) {
  if (!searchResults.contains(e.target) && e.target !== searchInput) {
    hideSearchResults();
    favoritesColumn.classList.remove("active");
  }
});
function minustenseconds() {
  if (!player || !playerReady || !player.getCurrentTime || !player.getDuration)
    return;
  const currentTime = player.getCurrentTime();
  const newTime = Math.max(0, currentTime - 10);
  player.seekTo(newTime, true);
}
function minusfiveseconds() {
  if (!player || !playerReady || !player.getCurrentTime || !player.getDuration)
    return;
  const currentTime = player.getCurrentTime();
  const newTime = Math.max(0, currentTime - 5);
  player.seekTo(newTime, true);
}
function plusfiveseconds() {
  if (!player || !playerReady || !player.getCurrentTime || !player.getDuration)
    return;
  const currentTime = player.getCurrentTime();
  const duration = player.getDuration();
  const newTime = Math.min(currentTime + 5, duration);
  player.seekTo(newTime, true);
}
function plustenseconds() {
  if (!player || !playerReady || !player.getCurrentTime || !player.getDuration)
    return;
  const currentTime = player.getCurrentTime();
  const duration = player.getDuration();
  const newTime = Math.min(currentTime + 10, duration);
  player.seekTo(newTime, true);
}
favoriteBtn.addEventListener("click", () => {
  if (favorites.length >= 10) {
    alert("Maximum 10 favorites allowed!");
    return;
  }
  const track = {
    title: currentTrack.title,
    artist: currentTrack.artist,
    artwork: currentTrack.artwork,
    genre: currentTrack.genre,
  };
  if (isFavorite) {
    favorites = favorites.filter(
      (fav) => fav.title !== track.title || fav.artist !== track.artist,
    );
  } else {
    favorites.push(track);
  }
  localStorage.setItem("favorites", JSON.stringify(favorites));
  isFavorite = !isFavorite;
  favoriteBtn.className = isFavorite
    ? "fa-solid fa-heart control-btn"
    : "fa-regular fa-heart control-btn";
  updateFavorites();
});

function updateFavorites() {
  favoritesColumn.innerHTML = `
<div class="favorites-title">Favorites</div>
<div class="play-favorites-btn" id="playFavoritesBtn"><i class="fas fa-play"></i> Play Favorites</div>
${favorites
  .map(
    (fav) => `
<div class="favorite-item" onclick="playSong('${fav.title}', '${fav.artist}', '${fav.artwork}', '${fav.genre}');currentFavoriteIndex=${favorites.findIndex((f) => f.title === "${fav.title}" && f.artist === "${fav.artist}")}">
<div class="result-img"><img src="${fav.artwork.replace("100x100", "600x600")}" alt="${fav.title}"></div>
<div class="result-info">
<div class="result-title">${fav.title}</div>
<div class="result-artist">${fav.artist}</div>
</div>
<i class="fa-solid fa-times remove-fav" onclick="event.stopPropagation();removeFavorite('${fav.title}', '${fav.artist}')"></i>
<i class="fa-solid fa-step-backward skip-prev" onclick="event.stopPropagation();skipFavoritePrev('${fav.title}', '${fav.artist}')"></i>
<i class="fa-solid fa-step-forward skip-next" onclick="event.stopPropagation();skipFavoriteNext('${fav.title}', '${fav.artist}')"></i>
</div>
`,
  )
  .join("")}
`;
  const newPlayFavoritesBtn = document.querySelector("#playFavoritesBtn");
  if (newPlayFavoritesBtn) {
    newPlayFavoritesBtn.addEventListener("click", playFavorites);
  }
}
function removeFavorite(title, artist) {
  favorites = favorites.filter(
    (fav) => fav.title !== title || fav.artist !== artist,
  );
  localStorage.setItem("favorites", JSON.stringify(favorites));
  if (currentFavoriteIndex >= favorites.length) {
    currentFavoriteIndex = -1;
  }
  updateFavorites();
}
function skipFavoritePrev(title, artist) {
  const index = favorites.findIndex(
    (fav) => fav.title === title && fav.artist === artist,
  );
  if (index > 0) {
    currentFavoriteIndex = index - 1;
    playSong(
      favorites[currentFavoriteIndex].title,
      favorites[currentFavoriteIndex].artist,
      favorites[currentFavoriteIndex].artwork,
      favorites[currentFavoriteIndex].genre,
    );
  } else {
    currentFavoriteIndex = favorites.length - 1;
    playSong(
      favorites[currentFavoriteIndex].title,
      favorites[currentFavoriteIndex].artist,
      favorites[currentFavoriteIndex].artwork,
      favorites[currentFavoriteIndex].genre,
    );
  }
}
function skipFavoriteNext(title, artist) {
  const index = favorites.findIndex(
    (fav) => fav.title === title && fav.artist === artist,
  );
  if (index < favorites.length - 1) {
    currentFavoriteIndex = index + 1;
    playSong(
      favorites[currentFavoriteIndex].title,
      favorites[currentFavoriteIndex].artist,
      favorites[currentFavoriteIndex].artwork,
      favorites[currentFavoriteIndex].genre,
    );
  } else {
    currentFavoriteIndex = 0;
    playSong(
      favorites[currentFavoriteIndex].title,
      favorites[currentFavoriteIndex].artist,
      favorites[currentFavoriteIndex].artwork,
      favorites[currentFavoriteIndex].genre,
    );
  }
}
function playFavorites() {
  if (favorites.length === 0) return;
  currentFavoriteIndex = 0;
  playSong(
    favorites[0].title,
    favorites[0].artist,
    favorites[0].artwork,
    favorites[0].genre,
  );
}
function playNextFavorite() {
  if (currentFavoriteIndex < favorites.length - 1) {
    currentFavoriteIndex++;
    playSong(
      favorites[currentFavoriteIndex].title,
      favorites[currentFavoriteIndex].artist,
      favorites[currentFavoriteIndex].artwork,
      favorites[currentFavoriteIndex].genre,
    );
  } else {
    currentFavoriteIndex = 0;
    playSong(
      favorites[0].title,
      favorites[0].artist,
      favorites[0].artwork,
      favorites[0].genre,
    );
  }
}
window.addEventListener("DOMContentLoaded", () => {
  document
    .querySelector("#backward10")
    ?.addEventListener("click", minustenseconds);
  document
    .querySelector("#backward5")
    ?.addEventListener("click", minusfiveseconds);
  document
    .querySelector("#forward5")
    ?.addEventListener("click", plusfiveseconds);
  document
    .querySelector("#forward10")
    ?.addEventListener("click", plustenseconds);
  const loopToggle = document.querySelector("#loopToggle");
  let isLooping = false;
  loopToggle.addEventListener("click", () => {
    isLooping = !isLooping;
    loopToggle.className = isLooping
      ? "fa-solid fa-repeat-1 control-btn"
      : "fa-solid fa-repeat control-btn";
  });
  updateFavorites();
  initPlayer();
});
