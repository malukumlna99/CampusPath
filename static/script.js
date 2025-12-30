/* ================= DATA ================= */

const questions = [
  "Saya merasa nyaman bekerja dengan perhitungan dan data",
  "Saya menikmati aktivitas berbagi ilmu atau mengajar orang lain",
  "Saya senang mencari solusi dari persoalan yang membutuhkan logika",
  "Saya memiliki ketertarikan pada kegiatan riset atau penelitian",
  "Saya menikmati proses berpikir secara analitis dan terstruktur",
  "Saya merasa senang saat berinteraksi dan bekerja bersama orang lain",
  "Saya tertarik pada kegiatan organisasi atau kepanitiaan",
  "Saya merasa nyaman berada dalam peran sebagai pemimpin",
  "Saya senang membantu menyelesaikan perbedaan atau konflik",
  "Saya menikmati bekerja dalam sebuah tim",
  "Saya memiliki minat terhadap perkembangan teknologi",
  "Saya senang membuat atau mengembangkan aplikasi",
  "Saya tertarik dengan dunia industri",
  "Saya menyukai hal-hal yang berkaitan dengan mesin",
  "Saya senang merancang atau menciptakan sesuatu",
  "Saya tertarik pada dunia bisnis",
  "Saya senang mengelola atau mengatur keuangan",
  "Saya tertarik pada bidang manajemen",
  "Saya memiliki ketertarikan untuk membangun usaha sendiri",
  "Saya senang menganalisis kondisi atau peluang pasar",
  "Saya tertarik pada bidang kesehatan",
  "Saya menyukai alam dan hal-hal yang berhubungan dengannya",
  "Saya senang melakukan aktivitas di luar ruangan",
  "Saya memiliki kepedulian terhadap kelestarian lingkungan",
  "Saya tertarik mempelajari makhluk hidup dan kehidupan biologis",
  "Saya memiliki minat dalam bidang desain",
  "Saya senang menuangkan ide melalui tulisan",
  "Saya merasa percaya diri berbicara di depan banyak orang",
  "Saya tertarik pada dunia media dan komunikasi",
  "Saya memiliki ketertarikan pada seni dan kreativitas"
];

const TOTAL = questions.length;
const PER_PAGE = 5;

let currentPage = 0;
const answers = Array(TOTAL).fill(5);

/* ================= ELEMENTS ================= */

const wrap = document.getElementById("questions");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const totalProgress = document.getElementById("totalProgress");
const currentRange = document.getElementById("currentRange");

/* ================= RENDER ================= */

function renderPage() {
  wrap.innerHTML = "";

  const start = currentPage * PER_PAGE;
  const end = Math.min(start + PER_PAGE, TOTAL);

  for (let i = start; i < end; i++) {
    wrap.innerHTML += `
      <div class="mb-4">

        <label class="fw-semibold mb-1 d-block">
          ${i + 1}. ${questions[i]}
        </label>

        <div class="d-flex justify-content-between mb-1"
             style="font-size:13px; color:#555;">
          <span>Sangat Tidak Setuju</span>
          <span>Sangat Setuju</span>
        </div>

        <input
          type="range"
          class="form-range"
          min="0"
          max="10"
          step="1"
          value="${answers[i]}"
          oninput="updateAnswer(${i}, this.value)"
        >

        <div class="progress mt-2" style="height:8px;">
          <div class="progress-bar bg-primary"
               style="width:${answers[i] * 10}%">
          </div>
        </div>

      </div>
    `;
  }

  prevBtn.disabled = currentPage === 0;
  nextBtn.innerText =
    currentPage === Math.floor((TOTAL - 1) / PER_PAGE)
      ? "Lihat Hasil"
      : "Selanjutnya →";

  updateProgress();
}


function updateAnswer(index, value) {
  answers[index] = Number(value);
  renderPage();
}

function updateProgress() {
  const percent = ((currentPage + 1) * PER_PAGE / TOTAL) * 100;
  totalProgress.style.width = percent + "%";
  currentRange.innerText =
    `${currentPage * PER_PAGE + 1}–${Math.min((currentPage + 1) * PER_PAGE, TOTAL)}`;
}

/* ================= NAV ================= */

nextBtn.onclick = () => {
  if (currentPage === Math.floor((TOTAL - 1) / PER_PAGE)) {
    submitTest();
  } else {
    currentPage++;
    renderPage();
  }
};

prevBtn.onclick = () => {
  if (currentPage > 0) {
    currentPage--;
    renderPage();
  }
};

/* ================= SUBMIT ================= */

async function submitTest() {
  const payload = {};
  answers.forEach((v, i) => payload[`p${i + 1}`] = v);

  try {
    const res = await fetch("/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    // hide test
    document.getElementById("testSection").classList.add("d-none");

    // show result
    document.getElementById("resultSection").classList.remove("d-none");

    const resultEl = document.getElementById("result");
    let html = '<ol class="list-group list-group-numbered">';

    data.top3.forEach(item => {
      html += `
        <li class="list-group-item d-flex justify-content-between align-items-center">
          <strong>${item.jurusan}</strong>
          <span class="badge bg-success rounded-pill">Top Match</span>
        </li>
      `;
    });

    html += '</ol>';
    resultEl.innerHTML = html;

  } catch (err) {
    alert("Gagal memproses hasil");
    console.error(err);
  }
}

/* ================= INIT ================= */

renderPage();
