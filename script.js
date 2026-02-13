const audio = document.getElementById('main-audio');
const cd = document.getElementById('cd-disk');
const cdCover = document.getElementById('cd-cover');
const playBtn = document.getElementById('play-btn');

let radios = [];
let mySongs = [];
let currentIdx = 0;
let isRadio = false;

// ALTERNAR MODO
window.setMode = function(mode) {
    isRadio = (mode === 'radio');
    document.getElementById('btn-mp3').classList.toggle('active', !isRadio);
    document.getElementById('btn-radio').classList.toggle('active', isRadio);
    
    if(isRadio) {
        if(radios.length === 0) loadRadios();
        else playStation(currentIdx);
    } else {
        document.getElementById('mp3-input').click(); // Abre seletor de arquivos
    }
};

// CARREGAR RÁDIOS
async function loadRadios() {
    try {
        const res = await fetch(`https://de1.api.radio-browser.info/json/stations/bycountry/brazil?limit=100&order=votes&reverse=true`);
        radios = await res.json();
        if(isRadio) playStation(0);
    } catch(e) { console.error("Erro API"); }
}

function playStation(index) {
    if(!radios[index]) return;
    currentIdx = index;
    const r = radios[index];
    audio.src = r.url_resolved;
    document.getElementById('track-title').innerText = r.name;
    document.getElementById('track-sub').innerText = r.state || "Brasil";
    cdCover.src = r.favicon || 'https://cdn-icons-png.flaticon.com/512/26/26433.png';
    audio.play();
}

// MP3 LOCAL
document.getElementById('mp3-input').onchange = (e) => {
    mySongs = Array.from(e.target.files);
    if(mySongs.length > 0) playMp3(0);
};

function playMp3(index) {
    if(!mySongs[index]) return;
    currentIdx = index;
    const s = mySongs[index];
    audio.src = URL.createObjectURL(s);
    document.getElementById('track-title').innerText = s.name;
    document.getElementById('track-sub').innerText = "MP3 Local";
    cdCover.src = 'https://www.pngall.com/wp-content/uploads/2/Vinyl-Record-PNG-Transparent-HD-Photo.png';
    audio.play();
}

// BOTÕES NEXT / PREV (FUNCIONAM PARA AMBOS)
window.handleNext = function() {
    if(isRadio && radios.length > 0) {
        currentIdx = (currentIdx + 1) % radios.length;
        playStation(currentIdx);
    } else if(!isRadio && mySongs.length > 0) {
        currentIdx = (currentIdx + 1) % mySongs.length;
        playMp3(currentIdx);
    }
};

window.handlePrev = function() {
    if(isRadio && radios.length > 0) {
        currentIdx = (currentIdx - 1 + radios.length) % radios.length;
        playStation(currentIdx);
    } else if(!isRadio && mySongs.length > 0) {
        currentIdx = (currentIdx - 1 + mySongs.length) % mySongs.length;
        playMp3(currentIdx);
    }
};

// CONTROLES BÁSICOS
window.togglePlay = () => audio.src ? (audio.paused ? audio.play() : audio.pause()) : null;
audio.onplay = () => { cd.classList.add('playing'); playBtn.innerHTML = '<i class="fas fa-pause"></i>'; };
audio.onpause = () => { cd.classList.remove('playing'); playBtn.innerHTML = '<i class="fas fa-play"></i>'; };

// VOLUME E PROGRESSO
document.getElementById('volume-slider').oninput = (e) => audio.volume = e.target.value;
audio.ontimeupdate = () => {
    const pct = (audio.currentTime / audio.duration) * 100;
    document.getElementById('progress-fill').style.width = pct + "%";
};

loadRadios(); // Carrega lista em background
