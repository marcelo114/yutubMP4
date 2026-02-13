// ==========================================
// P2 ULTIMATE - JS YOUTUBE EDITION
// ==========================================

const audio = document.getElementById('main-audio');
const cd = document.getElementById('cd-disk');
const cdCover = document.getElementById('cd-cover');
const playBtn = document.getElementById('play-btn');

// Elementos de Progresso e Volume
const progressFill = document.getElementById('progress-fill');
const progressContainer = document.getElementById('progress-bar-click');
const timeCurrent = document.getElementById('time-current');
const timeTotal = document.getElementById('time-total');
const volumeSlider = document.getElementById('volume-slider');

let radios = [];
let mySongs = [];
let currentIdx = -1;
let isRadio = false;
let favorites = JSON.parse(localStorage.getItem('p2_favs')) || [];

// 1. ALTERNAR MODOS (MP3 / RÁDIO)
window.setMode = function(mode) {
    isRadio = (mode === 'radio');
    
    // Atualiza botões do menu
    document.getElementById('btn-mp3').classList.toggle('active', !isRadio);
    document.getElementById('btn-radio').classList.toggle('active', isRadio);
    
    // Mostra/Esconde painéis
    document.getElementById('panel-mp3').classList.toggle('hidden', isRadio);
    document.getElementById('panel-radio').classList.toggle('hidden', !isRadio);
    
    audio.pause();
    resetProgress();
    if(isRadio && radios.length === 0) loadRadios();
};

// 2. CONVERSOR YOUTUBE
window.startConversion = function() {
    const url = document.getElementById('yt-url').value.trim();
    if(!url.includes('youtu')) return alert("Por favor, cole um link válido do YouTube!");
    
    document.getElementById('yt-input-ui').classList.add('hidden');
    document.getElementById('yt-frame-ui').classList.remove('hidden');
    document.getElementById('conv-iframe').src = `https://ezconv.cc/?url=${encodeURIComponent(url)}`;
};

window.closeConversion = function() {
    document.getElementById('yt-input-ui').classList.remove('hidden');
    document.getElementById('yt-frame-ui').classList.add('hidden');
    document.getElementById('conv-iframe').src = "";
};

// 3. LÓGICA DE RÁDIOS E FAVORITOS
window.loadRadios = async function() {
    const area = document.getElementById('radio-list');
    area.innerHTML = "<div style='padding:20px; text-align:center; color:#ff0000;'><i class='fas fa-circle-notch fa-spin'></i> Buscando estações...</div>";
    
    const nodes = ['de1', 'at1', 'nl1'];
    const node = nodes[Math.floor(Math.random() * nodes.length)];
    const url = `https://${node}.api.radio-browser.info/json/stations/bycountry/brazil?limit=250&order=votes&reverse=true&cb=${Date.now()}`;

    try {
        const response = await fetch(url);
        radios = await response.json();
        renderRadios(radios);
    } catch (error) {
        area.innerHTML = "<p style='text-align:center; padding:10px;'>Erro ao carregar. Verifique sua conexão.</p>";
    }
};

function renderRadios(list) {
    const area = document.getElementById('radio-list');
    if(!area) return;
    area.innerHTML = '';
    
    // Ordenar favoritos para o topo
    const sortedList = [...list].sort((a, b) => {
        const aFav = favorites.includes(a.stationuuid) ? 1 : 0;
        const bFav = favorites.includes(b.stationuuid) ? 1 : 0;
        return bFav - aFav;
    });

    sortedList.forEach(r => {
        const isFav = favorites.includes(r.stationuuid);
        const div = document.createElement('div');
        div.className = 'item' + (audio.src === r.url_resolved ? ' active' : '');
        
        const imgUrl = (r.favicon && r.favicon.length > 10) ? r.favicon : 'https://cdn-icons-png.flaticon.com/512/26/26433.png';

        div.onclick = () => {
            audio.src = r.url_resolved;
            document.getElementById('track-title').innerText = r.name;
            document.getElementById('track-sub').innerText = r.state || "Brasil";
            cdCover.src = imgUrl;
            audio.play();
            renderRadios(radios); // Atualiza marcação de 'active'
        };

        div.innerHTML = `
            <img src="${imgUrl}" style="width:35px; height:35px; border-radius:4px; object-fit:cover; background:#000;" onerror="this.src='https://cdn-icons-png.flaticon.com/512/26/26433.png'">
            <div style="flex:1; overflow:hidden; margin-left:10px;">
                <b style="display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${r.name}</b>
            </div>
            <i class="fas fa-star fav-btn ${isFav ? 'active' : ''}" onclick="event.stopPropagation(); toggleFav('${r.stationuuid}')"></i>
        `;
        area.appendChild(div);
    });
}

window.toggleFav = function(id) {
    if (favorites.includes(id)) {
        favorites = favorites.filter(f => f !== id);
    } else {
        favorites.push(id);
    }
    localStorage.setItem('p2_favs', JSON.stringify(favorites));
    renderRadios(radios);
};

window.searchRadio = function() {
    const val = document.getElementById('radio-search').value.toLowerCase();
    renderRadios(radios.filter(r => r.name.toLowerCase().includes(val)));
};

// 4. BARRA DE PROGRESSO E VOLUME
audio.ontimeupdate = () => {
    if (audio.duration) {
        const pct = (audio.currentTime / audio.duration) * 100;
        if(progressFill) progressFill.style.width = pct + "%";
        if(timeCurrent) timeCurrent.innerText = formatTime(audio.currentTime);
        if(timeTotal) timeTotal.innerText = formatTime(audio.duration);
    }
};

if(progressContainer) {
    progressContainer.onclick = (e) => {
        if(!audio.duration || isRadio) return; // Desativa salto em rádio ao vivo
        const width = progressContainer.clientWidth;
        const clickX = e.offsetX;
        audio.currentTime = (clickX / width) * audio.duration;
    };
}

if(volumeSlider) {
    volumeSlider.oninput = (e) => { 
        audio.volume = e.target.value; 
    };
}

function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

function resetProgress() {
    if(progressFill) progressFill.style.width = "0%";
    if(timeCurrent) timeCurrent.innerText = "0:00";
    if(timeTotal) timeTotal.innerText = "0:00";
}

// 5. MP3 LOCAL
const mp3Input = document.getElementById('mp3-input');
if(mp3Input) {
    mp3Input.onchange = (e) => {
        const files = Array.from(e.target.files);
        mySongs = mySongs.concat(files);
        renderMp3();
    };
}

function renderMp3() {
    const area = document.getElementById('mp3-list');
    if(!area) return;
    area.innerHTML = '';
    mySongs.forEach((s, i) => {
        const div = document.createElement('div');
        div.className = 'item' + (currentIdx === i ? ' active' : '');
        div.onclick = () => {
            currentIdx = i;
            audio.src = URL.createObjectURL(s);
            document.getElementById('track-title').innerText = s.name;
            document.getElementById('track-sub').innerText = "Arquivo Local";
            cdCover.src = 'https://www.pngall.com/wp-content/uploads/2/Vinyl-Record-PNG-Transparent-HD-Photo.png';
            renderMp3();
            audio.play();
        };
        div.innerHTML = `<i class="fas fa-music" style="color:#3498db"></i> <span style="flex:1; margin-left:10px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${s.name}</span>`;
        area.appendChild(div);
    });
}

// 6. CONTROLES DE PLAYBACK
window.togglePlay = function() {
    if(!audio.src) return alert("Selecione uma música ou rádio primeiro!");
    audio.paused ? audio.play() : audio.pause();
};

window.handleNext = function() {
    if(!isRadio && mySongs.length > 0) {
        currentIdx = (currentIdx + 1) % mySongs.length;
        playByIndex(currentIdx);
    }
};

window.handlePrev = function() {
    if(!isRadio && mySongs.length > 0) {
        currentIdx = (currentIdx - 1 + mySongs.length) % mySongs.length;
        playByIndex(currentIdx);
    }
};

function playByIndex(i) {
    const items = document.querySelectorAll('#panel-mp3 .item');
    if(items[i]) items[i].click();
}

// ANIMAÇÕES
audio.onplay = () => { 
    cd.classList.add('playing'); 
    playBtn.innerHTML = '<i class="fas fa-pause"></i>'; 
};
audio.onpause = () => { 
    cd.classList.remove('playing'); 
    playBtn.innerHTML = '<i class="fas fa-play"></i>'; 
};

// Carregar rádios ao iniciar
loadRadios();
