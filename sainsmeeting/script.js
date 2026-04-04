// ==========================================
// PANGKALAN DATA GURU (Sila tambah/buang mengikut keperluan sekolah)
// ==========================================
const senaraiGuruAsal = [
"Mohd Alimie Bin Zawawi",
"Mohd Hakim Bin Awang",
"Mohd Yusof Bin Zakaria",
"Khalid Bin Hussin",
"Siti Nur Syahira Binti Sa'idi"

];

// ==========================================
// 1. KAWALAN KEHADIRAN (CHECKBOX PINTAR)
// ==========================================
function binaSenaraiGuruDOM(senaraiDisimpan = null) {
    const container = document.getElementById('senaraiGuruContainer');
    container.innerHTML = '';

    senaraiGuruAsal.forEach((namaGuru, index) => {
        // Semak jika data telah disimpan dalam cache sebelumnya
        let isHadir = true;
        let sebab = '';
        
        if (senaraiDisimpan && senaraiDisimpan[index]) {
            isHadir = senaraiDisimpan[index].hadir;
            sebab = senaraiDisimpan[index].sebab || '';
        }

        const div = document.createElement('div');
        div.className = "p-2 bg-gray-50 border rounded flex flex-col justify-center transition";
        div.innerHTML = `
            <label class="flex items-start gap-2 cursor-pointer w-full">
                <input type="checkbox" id="chk_guru_${index}" value="${namaGuru}" class="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" ${isHadir ? 'checked' : ''} onchange="tukarStatusKehadiran(${index})">
                <span class="text-sm font-semibold text-gray-700 leading-tight">${namaGuru}</span>
            </label>
            <div id="sebab_container_${index}" class="mt-2 pl-6 ${isHadir ? 'hidden' : 'block'}">
                <input type="text" id="sebab_guru_${index}" value="${sebab}" class="w-full border-b border-red-300 bg-red-50 p-1 text-xs focus:outline-none focus:border-red-600" placeholder="Sebab: (Cth: Cuti Sakit)" oninput="simpanKeLocalStorage()">
            </div>
        `;
        container.appendChild(div);
    });
}

function tukarStatusKehadiran(index) {
    const isChecked = document.getElementById(`chk_guru_${index}`).checked;
    const sebabContainer = document.getElementById(`sebab_container_${index}`);
    
    if (isChecked) {
        sebabContainer.classList.replace('block', 'hidden');
        document.getElementById(`sebab_guru_${index}`).value = ''; // Kosongkan sebab jika hadir semula
    } else {
        sebabContainer.classList.replace('hidden', 'block');
        document.getElementById(`sebab_guru_${index}`).focus();
    }
    simpanKeLocalStorage();
}


// ==========================================
// 2. KAWALAN KETINGGIAN TEXTAREA (AUTO-EXPAND)
// ==========================================
function autoExpand(field) {
    field.style.height = 'inherit';
    field.style.height = (field.scrollHeight + 2) + 'px';
}

document.addEventListener('input', function (event) {
    if (event.target.tagName.toLowerCase() === 'textarea') {
        autoExpand(event.target);
        simpanKeLocalStorage();
    }
}, false);


// ==========================================
// 3. LOGIK AGENDA & SUB-AGENDA AUTOMATIK
// ==========================================
function tambahAgenda(tajuk = '', senaraiSub = []) {
    const container = document.getElementById('senaraiAgenda');
    const divAgenda = document.createElement('div');
    divAgenda.className = "agenda-item bg-white p-3 sm:p-4 border rounded shadow-sm relative";
    
    divAgenda.innerHTML = `
        <div class="flex items-start gap-2 mb-2">
            <span class="font-bold sm:text-lg w-6 sm:w-8 no-agenda pt-1"></span>
            <textarea class="input-tajuk-agenda w-full border-b-2 border-transparent hover:border-gray-200 focus:border-blue-500 p-1 sm:p-2 font-bold uppercase resize-none overflow-hidden outline-none bg-gray-50 rounded transition text-sm sm:text-base" rows="1" placeholder="TAJUK AGENDA" oninput="semakSubAgendaBilaTajukDiisi(this)">${tajuk}</textarea>
            <button type="button" onclick="padamAgendaIni(this)" class="ml-1 sm:ml-2 bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200 text-xs sm:text-sm font-bold mt-1">X</button>
        </div>
        <div class="sub-agenda-container pl-6 sm:pl-10 space-y-2 mt-2"></div>
    `;
    container.appendChild(divAgenda);
    const subContainer = divAgenda.querySelector('.sub-agenda-container');

    if (senaraiSub.length > 0) {
        senaraiSub.forEach(subText => tambahSubAgendaDOM(subContainer, subText));
        if (senaraiSub[senaraiSub.length - 1].trim() !== '') tambahSubAgendaDOM(subContainer, '');
    } else if (tajuk.trim() !== '') {
        tambahSubAgendaDOM(subContainer, '');
    }

    setTimeout(() => {
        autoExpand(divAgenda.querySelector('.input-tajuk-agenda'));
        divAgenda.querySelectorAll('.input-sub-agenda').forEach(ta => autoExpand(ta));
    }, 10);

    kemaskiniNomborAgenda();
    simpanKeLocalStorage();
}

function semakSubAgendaBilaTajukDiisi(elemenTajuk) {
    const subContainer = elemenTajuk.closest('.agenda-item').querySelector('.sub-agenda-container');
    if (elemenTajuk.value.trim() !== '' && subContainer.children.length === 0) {
        tambahSubAgendaDOM(subContainer, '');
        kemaskiniNomborAgenda();
    }
}

function tambahSubAgendaDOM(container, kandungan = '') {
    const divSub = document.createElement('div');
    divSub.className = "sub-agenda-item flex items-start gap-1 sm:gap-2";
    divSub.innerHTML = `
        <span class="font-semibold text-xs sm:text-sm w-6 sm:w-8 no-sub-agenda pt-2 text-blue-600"></span>
        <textarea class="input-sub-agenda w-full border-b border-dashed border-gray-300 focus:border-blue-500 focus:border-solid p-1 sm:p-2 text-xs sm:text-sm resize-none overflow-hidden outline-none bg-transparent" rows="1" placeholder="Butiran... (Nombor baru muncul bila ditaip)" oninput="semakTambahSubAgendaBaru(this)">${kandungan}</textarea>
    `;
    container.appendChild(divSub);
    kemaskiniNomborAgenda();
}

function semakTambahSubAgendaBaru(elemenSub) {
    const container = elemenSub.closest('.sub-agenda-container');
    const semuaSub = container.querySelectorAll('.sub-agenda-item');
    if (elemenSub.closest('.sub-agenda-item') === semuaSub[semuaSub.length - 1] && elemenSub.value.trim() !== '') {
        tambahSubAgendaDOM(container, '');
    }
}

function padamAgendaIni(butang) {
    if(confirm("Padam agenda ini dan semua isinya?")) {
        butang.closest('.agenda-item').remove();
        kemaskiniNomborAgenda();
        simpanKeLocalStorage();
    }
}

function kemaskiniNomborAgenda() {
    document.querySelectorAll('.agenda-item').forEach((item, indexAgenda) => {
        const noAgendaTerkini = indexAgenda + 1;
        item.querySelector('.no-agenda').innerText = noAgendaTerkini + ".0";
        item.querySelectorAll('.sub-agenda-item').forEach((sub, indexSub) => {
            sub.querySelector('.no-sub-agenda').innerText = noAgendaTerkini + "." + (indexSub + 1);
        });
    });
}


// ==========================================
// 4. AUTO-SAVE & LOAD LOCAL STORAGE
// ==========================================
function simpanKeLocalStorage() {
    // Kumpul data kehadiran dari Checkbox
    const statusGuru = [];
    senaraiGuruAsal.forEach((nama, index) => {
        const checkbox = document.getElementById(`chk_guru_${index}`);
        if(checkbox) { // Make sure DOM is loaded
            statusGuru.push({
                hadir: checkbox.checked,
                sebab: document.getElementById(`sebab_guru_${index}`).value
            });
        }
    });

    const agendaLengkap = [];
    document.querySelectorAll('.agenda-item').forEach(item => {
        const senaraiSub = [];
        item.querySelectorAll('.input-sub-agenda').forEach(sub => senaraiSub.push(sub.value));
        agendaLengkap.push({
            tajuk: item.querySelector('.input-tajuk-agenda').value,
            subAgendas: senaraiSub
        });
    });

    const dataMinit = {
        sekolah: document.getElementById('sekolah').value,
        tajuk: document.getElementById('tajuk').value,
        tarikh: document.getElementById('tarikh').value,
        masa: document.getElementById('masa').value,
        pengerusi: document.getElementById('pengerusi').value,
        tempat: document.getElementById('tempat').value,
        hadirPelawat: document.getElementById('hadirPelawat').value,
        statusGuru: statusGuru,
        agenda: agendaLengkap,
        disediakanNama: document.getElementById('disediakanNama').value,
        disediakanJawatan: document.getElementById('disediakanJawatan').value,
        disahkanNama: document.getElementById('disahkanNama').value,
        disahkanJawatan: document.getElementById('disahkanJawatan').value,
    };
    localStorage.setItem('minitModenDataV3', JSON.stringify(dataMinit));
}

document.getElementById('minitForm').addEventListener('input', simpanKeLocalStorage);

window.onload = function() {
    const simpanan = localStorage.getItem('minitModenDataV3');
    if (simpanan) {
        const data = JSON.parse(simpanan);
        document.getElementById('sekolah').value = data.sekolah || '';
        document.getElementById('tajuk').value = data.tajuk || '';
        document.getElementById('tarikh').value = data.tarikh || '';
        document.getElementById('masa').value = data.masa || '';
        document.getElementById('pengerusi').value = data.pengerusi || '';
        document.getElementById('tempat').value = data.tempat || '';
        document.getElementById('hadirPelawat').value = data.hadirPelawat || '';
        
        document.getElementById('disediakanNama').value = data.disediakanNama || '';
        document.getElementById('disediakanJawatan').value = data.disediakanJawatan || '';
        document.getElementById('disahkanNama').value = data.disahkanNama || '';
        document.getElementById('disahkanJawatan').value = data.disahkanJawatan || '';

        binaSenaraiGuruDOM(data.statusGuru); // Bina checkbox

        if (data.agenda && data.agenda.length > 0) {
            data.agenda.forEach(item => tambahAgenda(item.tajuk, item.subAgendas));
        } else {
            tambahAgenda();
        }
    } else {
        binaSenaraiGuruDOM(); // Bina checkbox tanpa data lama
        tambahAgenda();
    }
};


// ==========================================
// 5. PAPAR PRATONTON & SUNTINGAN CETAKAN
// ==========================================
function paparPratonton() {
    document.getElementById('cetakSekolah').innerText = document.getElementById('sekolah').value;
    document.getElementById('cetakTajuk').innerText = document.getElementById('tajuk').value;
    document.getElementById('cetakTarikh').innerText = document.getElementById('tarikh').value;
    document.getElementById('cetakMasa').innerText = document.getElementById('masa').value;
    document.getElementById('cetakTempat').innerText = document.getElementById('tempat').value;
    document.getElementById('cetakPengerusi').innerText = document.getElementById('pengerusi').value;
    document.getElementById('cetakSediaNama').innerText = document.getElementById('disediakanNama').value;
    document.getElementById('cetakSediaJawatan').innerText = document.getElementById('disediakanJawatan').value;
    document.getElementById('cetakSahNama').innerText = document.getElementById('disahkanNama').value;
    document.getElementById('cetakSahJawatan').innerText = document.getElementById('disahkanJawatan').value;

    // --- Pemprosesan Data Kehadiran ---
    const htmlHadir = [];
    const htmlTidakHadir = [];
    
    senaraiGuruAsal.forEach((nama, index) => {
        const checkbox = document.getElementById(`chk_guru_${index}`);
        const sebab = document.getElementById(`sebab_guru_${index}`).value.trim();
        
        if (checkbox.checked) {
            htmlHadir.push(nama);
        } else {
            htmlTidakHadir.push(`${nama} - (${sebab || 'Tiada Alasan Diberikan'})`);
        }
    });

    // Papar Senarai Hadir
    document.getElementById('cetakHadir').innerHTML = htmlHadir.length > 0 
        ? htmlHadir.map((n, i) => `<div>${i+1}. ${n}</div>`).join('') 
        : '<div>- Tiada Rekod -</div>';

    // Papar Senarai Pelawat jika ada
    const pelawat = document.getElementById('hadirPelawat').value.trim();
    if (pelawat !== '') {
        document.getElementById('kawasanTurutHadir').classList.remove('hidden');
        document.getElementById('cetakTurutHadir').innerText = pelawat;
    } else {
        document.getElementById('kawasanTurutHadir').classList.add('hidden');
    }

    // Papar Senarai Tidak Hadir
    if (htmlTidakHadir.length > 0) {
        document.getElementById('kawasanTidakHadir').classList.remove('hidden');
        document.getElementById('cetakTidakHadir').innerHTML = htmlTidakHadir.map((n, i) => `<div>${i+1}. ${n}</div>`).join('');
    } else {
        document.getElementById('kawasanTidakHadir').classList.add('hidden');
    }

    // --- Pemprosesan Data Agenda ---
    const cetakAgendaContainer = document.getElementById('cetakAgendaContainer');
    cetakAgendaContainer.innerHTML = ''; 
    let indexCetak = 1;
    
    document.querySelectorAll('.agenda-item').forEach(item => {
        const tajuk = item.querySelector('.input-tajuk-agenda').value.trim();
        const subAgendasDiisi = Array.from(item.querySelectorAll('.input-sub-agenda'))
                                     .map(sub => sub.value.trim())
                                     .filter(teks => teks !== ''); 
        
        if(tajuk !== '' || subAgendasDiisi.length > 0) {
            const div = document.createElement('div');
            div.className = "mb-4 agenda-cetak-block";
            let htmlCetakan = '';
            
            if(tajuk !== '') {
                htmlCetakan += `
                    <div class="flex gap-2 sm:gap-4 font-bold uppercase mb-2">
                        <span class="w-6 sm:w-8">${indexCetak}.0</span>
                        <span class="flex-1">${tajuk}</span>
                    </div>
                `;
            }
            if(subAgendasDiisi.length > 0) {
                subAgendasDiisi.forEach((teksSub, indexSub) => {
                    htmlCetakan += `
                        <div class="flex gap-2 sm:gap-4 mb-2 pl-2 sm:pl-4">
                            <span class="w-6 sm:w-8 font-semibold">${indexCetak}.${indexSub + 1}</span>
                            <span class="flex-1 whitespace-pre-wrap text-justify leading-relaxed">${teksSub}</span>
                        </div>
                    `;
                });
            }
            div.innerHTML = htmlCetakan;
            cetakAgendaContainer.appendChild(div);
            indexCetak++; 
        }
    });

    document.getElementById('modBorang').classList.add('hidden');
    document.getElementById('modPratonton').classList.remove('hidden');
    window.scrollTo(0,0);
}

function kembaliEdit() {
    document.getElementById('modPratonton').classList.add('hidden');
    document.getElementById('modBorang').classList.remove('hidden');
}

function padamDraf() {
    if(confirm("Padam semua maklumat draf?")){
        localStorage.removeItem('minitModenDataV3');
        location.reload(); 
    }
}
