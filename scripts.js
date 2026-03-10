/**
 * Exam Timer - Logic & Animations
 */

let remaining = 0;
let interval = null;
let isRunning = false;

// Ses dosyasını daha güvenilir bir kaynakla güncelledik
const gongSound = new Audio('https://actions.google.com/sounds/v1/cartoon/cartoon_cowbell.ogg');

// Element Seçiciler
const countEl = document.getElementById("count");
const startPauseBtn = document.getElementById("startPause");
const resetBtn = document.getElementById("reset");
const btnText = startPauseBtn.querySelector(".front");
const inputs = document.querySelectorAll(".time-inputs input");

/**
 * Zamanı HH:MM:SS formatına dönüştürür ve ekrana basar
 */
function updateDisplay(totalSeconds) {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    
    countEl.textContent = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    
    // Süre azaldığında görsel uyarı (Son 10 saniye)
    if (totalSeconds <= 10 && totalSeconds > 0) {
        countEl.style.color = "#ff5252";
    } else if (totalSeconds === 0 && isRunning) {
        countEl.style.color = "#ff0000";
    } else {
        countEl.style.color = "whitesmoke";
    }
}

/**
 * Input alanlarından saniye cinsinden toplam süreyi alır
 */
function getInputSeconds() {
    const h = Math.max(0, parseInt(document.getElementById("hours").value) || 0);
    const m = Math.max(0, parseInt(document.getElementById("minutes").value) || 0);
    const s = Math.max(0, parseInt(document.getElementById("seconds").value) || 0);
    return (h * 3600) + (m * 60) + s;
}

/**
 * Timer çalışırken inputları kilitler/açar
 */
function toggleInputs(disabled) {
    inputs.forEach(input => input.disabled = disabled);
    const inputContainer = document.getElementById("poda");
    if (inputContainer) {
        inputContainer.style.opacity = disabled ? "0.4" : "1";
        inputContainer.style.pointerEvents = disabled ? "none" : "auto";
    }
}

/**
 * Başlat/Durdur ve Bitir mantığını yönetir
 */
function toggleTimer() {
    // 1. DURUM: Sınav bittiyse (Butonda "Finish Exam" yazıyorsa) resetle
    if (btnText.textContent === "Finish Exam") {
        resetTimer();
        return;
    }

    // 2. DURUM: Sayaç çalışmıyorsa (Başlat veya Devam Et)
    if (!isRunning) {
        if (remaining <= 0) {
            remaining = getInputSeconds();
            if (remaining <= 0) {
                alert("Please enter a valid duration!");
                return;
            }
        }
        
        toggleInputs(true);
        btnText.textContent = "Pause Exam";
        isRunning = true;

        interval = setInterval(() => {
            if (remaining > 0) {
                remaining--;
                updateDisplay(remaining);
            } else {
                completeTimer();
            }
        }, 1000);
    } 
    // 3. DURUM: Sayaç çalışıyorsa (Duraklat)
    else {
        stopTimer();
        btnText.textContent = "Resume Exam";
    }
}

/**
 * Sayacı durdurur
 */
function stopTimer() {
    clearInterval(interval);
    interval = null;
    isRunning = false;
}

/**
 * Süre bittiğinde çalışan fonksiyon
 */
function completeTimer() {
    stopTimer();
    
    // Görsel Güncellemeler
    countEl.textContent = "TIME UP!";
    btnText.textContent = "Finish Exam"; // Buton metni isteğine göre güncellendi
    
    // Ses Çalma (Daha güvenilir tetikleme)
    gongSound.currentTime = 0;
    gongSound.play().catch(error => console.log("Tarayıcı sesi engelledi, etkileşim gerekiyor."));
    
    // Konfeti efekti (15 Saniye)
    launchCelebration();
}

/**
 * Her şeyi sıfırlar
 */
function resetTimer() {
    stopTimer();
    toggleInputs(false);
    remaining = 0;
    updateDisplay(0);
    btnText.textContent = "Start Exam";
    countEl.style.color = "whitesmoke";
    
    // Inputları temizle
    inputs.forEach(input => input.value = "");
}

/**
 * Canvas-Confetti Kütüphanesi ile Havai Fişek Efekti
 */
function launchCelebration() {
    const duration = 15 * 1000; // 15 Saniye sürer
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    const intervalId = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(intervalId);
        }

        const particleCount = 60 * (timeLeft / duration);
        
        confetti(Object.assign({}, defaults, { 
            particleCount, 
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
            colors: ['#cf30aa', '#402fb5', '#e2034d']
        }));
        
        confetti(Object.assign({}, defaults, { 
            particleCount, 
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
            colors: ['#cf30aa', '#402fb5', '#e2034d']
        }));
    }, 250);
}

// Event Listeners
startPauseBtn.addEventListener("click", toggleTimer);
resetBtn.addEventListener("click", resetTimer);

// Input değiştiğinde sayacı canlı güncelle (Sadece dururken)
inputs.forEach(input => {
    input.addEventListener("input", () => {
        if (!isRunning) {
            remaining = getInputSeconds();
            updateDisplay(remaining);
        }
    });
});

// Sayfa yüklendiğinde başlat

updateDisplay(0);
