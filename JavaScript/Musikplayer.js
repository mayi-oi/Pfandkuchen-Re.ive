const audio = document.getElementById('audio-player');
const uploadInput = document.getElementById('upload-input');

const btnPlay = document.getElementById('btn-play');
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');
const btnRepeat = document.getElementById('btn-repeat');
const btnShuffle = document.getElementById('btn-shuffle');
const btnMenu = document.getElementById('btn-menu');
const btnUpload = document.getElementById('btn-upload');
const btnDelete = document.getElementById('btn-delete');

const titleEl = document.getElementById('Musik-title');
const nameEl = document.getElementById('Musik-name');
const coverEl = document.getElementById('musik-cover');

const timeCurrent = document.getElementById('time-current');
const timeTotal = document.getElementById('time-total');
const progressBar = document.getElementById('progress-bar');
const progressFill = document.getElementById('progress-fill');

const volumeBar = document.getElementById('volume-bar');
const volumeFill = document.getElementById('volume-fill');

const playlistContainer = document.getElementById('playlist-container');
const playlistEmpty = document.getElementById('playlist-empty');

const PLAY_ICON = 'src/Bilder/Icon/Musikplayer/play_arrow_24dp_FFFFFF_FILL1_wght400_GRAD0_opsz24.svg';
const PAUSE_ICON = 'src/Bilder/Icon/Musikplayer/pause_24dp_FFFFFF_FILL1_wght400_GRAD0_opsz24.svg';
const REPEAT_ON = 'src/Bilder/Icon/Musikplayer/repeat_on_24dp_FFFFFF_FILL1_wght400_GRAD0_opsz24.svg';
const REPEAT_OFF = 'src/Bilder/Icon/Musikplayer/repeat_24dp_FFFFFF_FILL1_wght400_GRAD0_opsz24.svg';
const SHUFFLE_ON = 'src/Bilder/Icon/Musikplayer/shuffle_on_24dp_FFFFFF_FILL1_wght400_GRAD0_opsz24.svg';
const SHUFFLE_OFF = 'src/Bilder/Icon/Musikplayer/shuffle_24dp_FFFFFF_FILL1_wght400_GRAD0_opsz24.svg';

let playlist = [];
let currentIndex = 0;
let isPlaying = false;
let isShuffle = false;
let isRepeat = false;
let shuffleOrder = [];

const defaultCover = 'src/Hintergrund/Bilder/puscas-adryan-gr29vc3r1Jc-unsplash.jpg';

const defaultSongs = [
    { name: 'デジタルな夢の世界', file: 'src/Musik/デジタルな夢の世界.mp3', cover: 'src/Hintergrund/Bilder/Default cover/66b784cf-3e04-4471-9a7c-d2e60073cecc_base_resized.jpg' },
    { name: 'ぷるぷるプリン', file: 'src/Musik/にゃるぱかBGM工房_ぷるぷるプリン_楽しい_かわいい_アップテンポ.mp3', cover: 'src/Hintergrund/Bilder/Default cover/21d21268-800d-4ed1-a7a6-7227fcf24c4e_base_resized.jpg' },
    { name: 'ほうかごクエスト', file: 'src/Musik/ほうかごクエスト.mp3', cover: 'src/Hintergrund/Bilder/Default cover/25714e29-905e-47bd-abf4-0427828b3623_base_resized.jpg' }
];

function init() {
    const saved = localStorage.getItem('musikplayer-playlist');
    if (saved) {
        try {
            playlist = JSON.parse(saved);
        } catch (e) {
            playlist = [...defaultSongs];
        }
    } else {
        playlist = [...defaultSongs];
    }

    if (playlist.length > 0) {
        loadTrack(currentIndex, false);
    }

    audio.volume = 0.8;
    updateVolumeUI();
    renderPlaylist();
}

function savePlaylist() {
    const toSave = playlist
        .filter(s => !s.file.startsWith('blob:'))
        .map(s => ({ name: s.name, file: s.file, cover: s.cover || defaultCover }));
    localStorage.setItem('musikplayer-playlist', JSON.stringify(toSave));
}

function loadTrack(index, autoplay = true) {
    if (playlist.length === 0) {
        titleEl.textContent = 'Kein Lied ausgewählt';
        nameEl.textContent = 'Wähle ein Lied aus der Playlist';
        coverEl.src = defaultCover;
        audio.src = '';
        return;
    }

    index = ((index % playlist.length) + playlist.length) % playlist.length;
    currentIndex = index;

    const song = playlist[index];
    audio.src = song.file;
    titleEl.textContent = song.name;
    nameEl.textContent = `Lied ${index + 1} von ${playlist.length}`;

    if (song.cover) {
        coverEl.src = song.cover;
    } else {
        coverEl.src = defaultCover;
    }

    progressFill.style.width = '0%';
    timeCurrent.textContent = '0:00';
    timeTotal.textContent = '0:00';

    renderPlaylist();

    if (autoplay) {
        audio.play().then(() => {
            isPlaying = true;
            updatePlayButton();
        }).catch(() => {});
    }
}

function togglePlay() {
    if (playlist.length === 0) return;

    if (isPlaying) {
        audio.pause();
        isPlaying = false;
    } else {
        if (!audio.src || audio.src === window.location.href) {
            loadTrack(currentIndex, true);
        } else {
            audio.play().then(() => {
                isPlaying = true;
            }).catch(() => {});
        }
    }
    updatePlayButton();
}

function updatePlayButton() {
    btnPlay.querySelector('img').src = isPlaying ? PAUSE_ICON : PLAY_ICON;
}

function playNext() {
    if (playlist.length === 0) return;

    if (isShuffle) {
        if (shuffleOrder.length === 0) {
            generateShuffleOrder();
        }
        const nextIndex = shuffleOrder.shift();
        loadTrack(nextIndex, true);
    } else {
        loadTrack(currentIndex + 1, true);
    }
}

function playPrev() {
    if (playlist.length === 0) return;

    if (audio.currentTime > 3) {
        audio.currentTime = 0;
        return;
    }

    if (isShuffle) {
        if (shuffleOrder.length === 0) {
            generateShuffleOrder();
        }
        const prevIndex = shuffleOrder.pop();
        loadTrack(prevIndex, true);
    } else {
        loadTrack(currentIndex - 1, true);
    }
}

function toggleRepeat() {
    isRepeat = !isRepeat;
    btnRepeat.querySelector('img').src = isRepeat ? REPEAT_ON : REPEAT_OFF;
    btnRepeat.classList.toggle('active', isRepeat);
}

function toggleShuffle() {
    isShuffle = !isShuffle;
    btnShuffle.querySelector('img').src = isShuffle ? SHUFFLE_ON : SHUFFLE_OFF;
    btnShuffle.classList.toggle('active', isShuffle);

    if (isShuffle) {
        generateShuffleOrder();
    } else {
        shuffleOrder = [];
    }
}

function generateShuffleOrder() {
    shuffleOrder = [];
    for (let i = 0; i < playlist.length; i++) {
        if (i !== currentIndex) {
            shuffleOrder.push(i);
        }
    }
    for (let i = shuffleOrder.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffleOrder[i], shuffleOrder[j]] = [shuffleOrder[j], shuffleOrder[i]];
    }
}

function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function updateProgress() {
    if (audio.duration) {
        const percent = (audio.currentTime / audio.duration) * 100;
        progressFill.style.width = percent + '%';
        timeCurrent.textContent = formatTime(audio.currentTime);
        timeTotal.textContent = formatTime(audio.duration);
    }
}

function seekTo(e) {
    if (!audio.duration) return;
    const rect = progressBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audio.currentTime = percent * audio.duration;
}

function setVolume(e) {
    const rect = volumeBar.getBoundingClientRect();
    let percent = (e.clientX - rect.left) / rect.width;
    percent = Math.max(0, Math.min(1, percent));
    audio.volume = percent;
    updateVolumeUI();
}

function updateVolumeUI() {
    volumeFill.style.width = (audio.volume * 100) + '%';
}

function renderPlaylist() {
    const items = playlistContainer.querySelectorAll('.Musikplayer-playlist-item');
    items.forEach(item => item.remove());

    if (playlist.length === 0) {
        playlistEmpty.style.display = 'block';
        return;
    }

    playlistEmpty.style.display = 'none';

    playlist.forEach((song, i) => {
        const item = document.createElement('div');
        item.className = 'Musikplayer-playlist-item' + (i === currentIndex ? ' playing' : '');
        item.innerHTML = `
            <span class="Musikplayer-playlist-item-name">${song.name}</span>
        `;
        item.addEventListener('click', () => {
            loadTrack(i, true);
        });
        playlistContainer.appendChild(item);
    });
}

function handleUpload(e) {
    const files = Array.from(e.target.files);
    files.forEach(file => {
        if (file.type.startsWith('audio/')) {
            const url = URL.createObjectURL(file);
            const name = file.name.replace(/\.[^/.]+$/, '');
            playlist.push({ name: name, file: url, cover: defaultCover });
        }
    });

    if (playlist.length > 0) {
        renderPlaylist();
        savePlaylist();
    }

    uploadInput.value = '';
}

function deletePlaylist() {
    playlist = [];
    currentIndex = 0;
    isPlaying = false;
    shuffleOrder = [];

    audio.pause();
    audio.src = '';

    updatePlayButton();
    renderPlaylist();
    localStorage.removeItem('musikplayer-playlist');

    titleEl.textContent = 'Kein Lied ausgewählt';
    nameEl.textContent = 'Wähle ein Lied aus der Playlist';
    coverEl.src = defaultCover;
    progressFill.style.width = '0%';
    timeCurrent.textContent = '0:00';
    timeTotal.textContent = '0:00';
}

btnPlay.addEventListener('click', togglePlay);
btnNext.addEventListener('click', playNext);
btnPrev.addEventListener('click', playPrev);
btnRepeat.addEventListener('click', toggleRepeat);
btnShuffle.addEventListener('click', toggleShuffle);
btnMenu.addEventListener('click', () => {
    document.querySelector('.Musikplayer-menü').classList.toggle('open');
});
btnUpload.addEventListener('click', () => uploadInput.click());
btnDelete.addEventListener('click', deletePlaylist);

uploadInput.addEventListener('change', handleUpload);

progressBar.addEventListener('click', seekTo);
volumeBar.addEventListener('click', setVolume);

audio.addEventListener('timeupdate', updateProgress);
audio.addEventListener('ended', () => {
    if (isRepeat) {
        audio.currentTime = 0;
        audio.play();
    } else {
        playNext();
    }
});
audio.addEventListener('loadedmetadata', () => {
    timeTotal.textContent = formatTime(audio.duration);
});

init();
