// Referências Globais
const audio = document.getElementById('main-audio');
const cd = document.getElementById('cd-disk');
const cdCover = document.getElementById('cd-cover');
const playBtn = document.getElementById('play-btn');

let radios = [];
let mySongs = [];
let currentIdx = -1;
let isRadio = false;

// 1. ALTERNAR MODOS (MP3 / RÁDIO)
window.setMode = function(mode) {
    isRadio = (mode === 'radio');
    
    document.getElementById('btn-mp3').classList.toggle('active', !isRadio);
    document.getElementById('btn-radio').classList.toggle('active', isRadio);
    document.getElementById('panel-mp3').classList.toggle('hidden', isRadio);
    document.getElementById('panel-radio').classList.toggle('hidden', !isRadio);
    
    audio.pause();
    cd.classList.remove('playing');
    playBtn.innerHTML = '<i class="fas fa-play"></i>';

    if(isRadio && radios.length === 0) {
        loadRadios(); // Carrega se a lista estiver vazia
    }
};

// 2. CONVERSOR YOUTUBE
window.startConversion = function() {
    const url = document.getElementById('yt-url').value.trim();
    if(!url.includes('youtu')) return alert("Link inválido!");
    
    document.getElementById('yt-input-ui').classList.add('hidden');
    document.getElementById('yt-frame-ui').classList.remove('hidden');
    document.getElementById('conv-iframe').src = `https://ezconv.cc/?url=${encodeURIComponent(url)}`;
};

window.closeConversion = function() {
    document.getElementById('yt-input-ui').classList.remove('hidden');
    document.getElementById('yt-frame-ui').classList.add('hidden');
    document.getElementById('conv-iframe').src = "";
};

// 3. LOGICA DAS RÁDIOS (CORREÇÃO API E COVER ART)
window.loadRadios = async function() {
    const area = document.getElementById('radio-list');
    area.innerHTML = "<i class='fas fa-sync fa-spin'></i> A procurar rádios...";
    
    // Tenta servidores diferentes para evitar bloqueios do GitHub
    const nodes = ['de1', 'at1', 'nl1'];
    const node = nodes[Math.floor(Math.random() * nodes.length)];
    const url = `https://${node}.api.radio-browser.info/json/stations/bycountry/brazil?limit=250&order=votes&reverse=true&cb=${Date.now()}`;

    try {
        const response = await fetch(url);
        radios = await response.json();
        renderRadios(radios);
    } catch (error) {
        area.innerHTML = "Erro ao carregar lista. <button onclick='loadRadios()'>Tentar novamente</button>";
    }
};

function renderRadios(list) {
    const area = document.getElementById('radio-list');
    area.innerHTML = '';
    
    list.forEach(r => {
        const div = document.createElement('div');
        div.className = 'item';
        
        // Capa da Rádio (Cover Art)
        const imgUrl = (r.favicon && r.favicon.length > 10) ? r.favicon : 'https://cdn-icons-png.flaticon.com/512/26/26433.png';

        div.onclick = () => {
            audio.src = r.url_resolved;
            document.getElementById('track-title').innerText = r.name;
            document.getElementById('track-sub').innerText = r.state || "Brasil";
            
            // FORÇA A TROCA DA CAPA NO CD
            cdCover.src = imgUrl;
            
            audio.play();
        };

        div.innerHTML = `
            <img src="${imgUrl}" style="width:30px; height:30px; border-radius:4px; object-fit:cover; background:#222;" onerror="this.src='https://cdn-icons-png.flaticon.com/512/26/26433.png'">
            <b>${r.name}</b>
        `;
        area.appendChild(div);
    });
}

window.searchRadio = function() {
    const val = document.getElementById('radio-search').value.toLowerCase();
    const filtered = radios.filter(r => r.name.toLowerCase().includes(val));
    renderRadios(filtered);
};

// 4. MP3 LOCAL
document.getElementById('mp3-input').onchange = (e) => {
    const files = Array.from(e.target.files);
    mySongs = mySongs.concat(files);
    renderMp3();
};

function renderMp3() {
    const area = document.getElementById('mp3-list');
    area.innerHTML = '';
    mySongs.forEach((s, i) => {
        const div = document.createElement('div');
        div.className = 'item' + (currentIdx === i ? ' active' : '');
        div.onclick = () => {
            currentIdx = i;
            audio.src = URL.createObjectURL(s);
            document.getElementById('track-title').innerText = s.name;
            document.getElementById('track-sub').innerText = "MP3 Local";
            cdCover.src = 'https://www.pngall.com/wp-content/uploads/2/Vinyl-Record-PNG-Transparent-HD-Photo.png';
            renderMp3();
            audio.play();
        };
        div.innerHTML = `<i class="fas fa-music"></i> ${s.name}`;
        area.appendChild(div);
    });
}

// 5. CONTROLES DE PLAYBACK
window.togglePlay = function() {
    if(!audio.src) return;
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

// ANIMAÇÃO DO CD
audio.onplay = () => { 
    cd.classList.add('playing'); 
    playBtn.innerHTML = '<i class="fas fa-pause"></i>'; 
};
audio.onpause = () => { 
    cd.classList.remove('playing'); 
    playBtn.innerHTML = '<i class="fas fa-play"></i>'; 
};

// CARREGAMENTO INICIAL
loadRadios();
