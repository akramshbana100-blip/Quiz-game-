// ============================================
// Firebase Configuration
// ============================================

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id"
};

// Initialize Firebase
let db = null;
let isFirebaseReady = false;

try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    isFirebaseReady = true;
    console.log('Firebase connected successfully');
} catch (error) {
    console.log('Firebase not configured yet:', error);
}

// ============================================
// Game State Management
// ============================================

const gameState = {
    currentScreen: 'home',
    currentQuestionIndex: 0,
    selectedCategory: 'عام',
    playerName: 'لاعب',
    score: 0,
    correctAnswers: 0,
    totalQuestions: 10,
    currentTimer: 30,
    questionStartTime: 0,
    totalTime: 0,
    questions: [],
    usedLifelines: {
        '50:50': false,
        'pause': false,
        'swap': false
    },
    timePaused: false,
    audioSettings: {
        volume: 70,
        musicEnabled: true,
        soundEffectsEnabled: true
    }
};

// ============================================
// Question Bank (قاعدة البيانات المحلية)
// ============================================

const questionBank = {
    عام: [
        {
            question: 'ما هي عاصمة فرنسا؟',
            options: ['باريس', 'لندن', 'برلين', 'روما'],
            correct: 0
        },
        {
            question: 'كم عدد قارات العالم؟',
            options: ['5', '6', '7', '8'],
            correct: 2
        },
        {
            question: 'أكبر محيط في العالم؟',
            options: ['الأطلسي', 'الهادئ', 'الهندي', 'المتجمد'],
            correct: 1
        },
        {
            question: 'ما هو أطول نهر في العالم؟',
            options: ['النيل', 'الأمازون', 'اليانجتسي', 'المسيسيبي'],
            correct: 0
        },
        {
            question: 'كم عدد دول الاتحاد الأوروبي؟',
            options: ['25', '27', '30', '32'],
            correct: 1
        }
    ],
    علوم: [
        {
            question: 'كم عدد العناصر الكيميائية الأساسية؟',
            options: ['92', '94', '118', '150'],
            correct: 2
        },
        {
            question: 'ما هي أصغر وحدة في الحياة؟',
            options: ['الذرة', 'الجزيء', 'الخلية', 'النواة'],
            correct: 2
        },
        {
            question: 'كم عدد عظام جسم الإنسان؟',
            options: ['186', '206', '226', '246'],
            correct: 1
        },
        {
            question: 'ما هو رمز الذهب الكيميائي؟',
            options: ['Ag', 'Au', 'Al', 'As'],
            correct: 1
        },
        {
            question: 'كم سرعة الضوء؟',
            options: ['300 ألف كم/ث', '300 مليون كم/ث', '150 مليون كم/ث', '500 مليون كم/ث'],
            correct: 1
        }
    ],
    تكنولوجيا: [
        {
            question: 'من مؤسس شركة Microsoft؟',
            options: ['ستيف جوبز', 'بيل غيتس', 'لاري بيج', 'مارك زوكربرج'],
            correct: 1
        },
        {
            question: 'في أي سنة تأسست شركة Apple؟',
            options: ['1975', '1976', '1977', '1978'],
            correct: 1
        },
        {
            question: 'كم عدد بتات في البايت؟',
            options: ['4', '8', '16', '32'],
            correct: 1
        },
        {
            question: 'ما هو أول متصفح إنترنت شهير؟',
            options: ['Chrome', 'Firefox', 'Netscape', 'Safari'],
            correct: 2
        },
        {
            question: 'من اخترع الويب العالمي (WWW)؟',
            options: ['تيم بيرنرز لي', 'بيل غيتس', 'ستيف جوبز', 'لينوس تورفالدز'],
            correct: 0
        }
    ],
    ثقافة: [
        {
            question: 'كم عدد ألوان قوس قزح؟',
            options: ['5', '6', '7', '8'],
            correct: 2
        },
        {
            question: 'من كتب رواية "مئة عام من العزلة"؟',
            options: ['خورخي لويس بورخيس', 'جابرييل غارسيا ماركيز', 'باولو كويلو', 'إيزابيل الليندي'],
            correct: 1
        },
        {
            question: 'ما هو أكبر متحف في العالم؟',
            options: ['المتحف البريطاني', 'متحف اللوفر', 'متحف الأرميتاج', 'متحف ميتروبوليتان'],
            correct: 2
        },
        {
            question: 'في أي سنة أقيمت أول أولمبياد حديثة؟',
            options: ['1890', '1896', '1900', '1904'],
            correct: 1
        },
        {
            question: 'كم عدد أوتار الجيتار العادي؟',
            options: ['4', '5', '6', '7'],
            correct: 2
        }
    ]
};

// ============================================
// DOM Elements
// ============================================

const screens = {
    home: document.getElementById('homeScreen'),
    game: document.getElementById('gameScreen'),
    result: document.getElementById('resultScreen'),
    leaderboard: document.getElementById('leaderboardScreen')
};

const categoryBtns = document.querySelectorAll('.category-btn');
const startBtn = document.getElementById('startBtn');
const playerNameInput = document.getElementById('playerName');
const leaderboardBtn = document.getElementById('leaderboardBtn');
const settingsBtn = document.getElementById('settingsBtn');
const quitBtn = document.getElementById('quitBtn');
const retryBtn = document.getElementById('retryBtn');
const homeBtn = document.getElementById('homeBtn');
const backBtn = document.getElementById('backBtn');

// Game elements
const questionText = document.getElementById('questionText');
const categoryTag = document.getElementById('categoryTag');
const optionsGrid = document.getElementById('optionsGrid');
const questionNumber = document.getElementById('questionNumber');
const scoreDisplay = document.getElementById('scoreDisplay');
const timerDisplay = document.getElementById('timer');
const progressFill = document.getElementById('progressFill');

// Lifelines
const lifeline50Btn = document.getElementById('lifeline50');
const lifelinePauseBtn = document.getElementById('lifelinePause');
const lifelineSwapBtn = document.getElementById('lifelineSwap');

// Settings
const settingsModal = document.getElementById('settingsModal');
const settingsBtn2 = document.getElementById('settingsBtn');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const volumeSlider = document.getElementById('volumeSlider');
const volumeValue = document.getElementById('volumeValue');
const musicToggle = document.getElementById('musicToggle');
const soundEffectsToggle = document.getElementById('soundEffectsToggle');
const adminPassword = document.getElementById('adminPassword');
const clearDataBtn = document.getElementById('clearDataBtn');

// Audio elements
const bgMusic = document.getElementById('bgMusic');
const clickSound = document.getElementById('clickSound');
const correctSound = document.getElementById('correctSound');
const wrongSound = document.getElementById('wrongSound');
const winSound = document.getElementById('winSound');

// ============================================
// Audio Setup
// ============================================

function setupAudio() {
    // استخدام Web Audio API لإنشاء أصوات
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // Click sound
    const clickOsc = audioContext.createOscillator();
    const clickGain = audioContext.createGain();
    clickOsc.frequency.value = 800;
    clickOsc.connect(clickGain);
    clickGain.connect(audioContext.destination);
    clickGain.gain.setValueAtTime(0.3, audioContext.currentTime);
    clickGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

    // Correct answer sound (musical)
    const correctOsc = audioContext.createOscillator();
    const correctGain = audioContext.createGain();
    correctOsc.frequency.value = 523.25; // C5
    correctOsc.connect(correctGain);
    correctGain.connect(audioContext.destination);

    // Background music (يمكن تعديلها)
    bgMusic.src = 'data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAAA=';
}

function playSound(soundType) {
    if (!gameState.audioSettings.soundEffectsEnabled) return;

    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        const volume = gameState.audioSettings.volume / 100;
        gainNode.gain.setValueAtTime(volume * 0.3, audioContext.currentTime);

        switch (soundType) {
            case 'click':
                oscillator.frequency.value = 800;
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.1);
                break;
            case 'correct':
                oscillator.frequency.value = 523.25;
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.3);
                break;
            case 'wrong':
                oscillator.frequency.value = 200;
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.2);
                break;
        }
    } catch (e) {
        console.log('Audio error:', e);
    }
}

// ============================================
// Event Listeners
// ============================================

categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        categoryBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        gameState.selectedCategory = btn.dataset.category;
        playSound('click');
    });
});

startBtn.addEventListener('click', startGame);
leaderboardBtn.addEventListener('click', showLeaderboard);
settingsBtn.addEventListener('click', openSettings);
closeSettingsBtn.addEventListener('click', closeSettings);
document.querySelector('.close-btn').addEventListener('click', closeSettings);
quitBtn.addEventListener('click', confirmQuit);
retryBtn.addEventListener('click', startGame);
homeBtn.addEventListener('click', () => switchScreen('home'));
backBtn.addEventListener('click', () => switchScreen('home'));

// Lifelines
lifeline50Btn.addEventListener('click', () => {
    if (!gameState.usedLifelines['50:50']) {
        apply50Lifeline();
    }
});

lifelinePauseBtn.addEventListener('click', () => {
    if (!gameState.usedLifelines['pause']) {
        applyPauseLifeline();
    }
});

lifelineSwapBtn.addEventListener('click', () => {
    if (!gameState.usedLifelines['swap']) {
        applySwapLifeline();
    }
});

// Settings
volumeSlider.addEventListener('input', (e) => {
    gameState.audioSettings.volume = parseInt(e.target.value);
    volumeValue.textContent = e.target.value + '%';
});

musicToggle.addEventListener('change', (e) => {
    gameState.audioSettings.musicEnabled = e.target.checked;
    if (e.target.checked) {
        bgMusic.play().catch(e => console.log('Auto-play blocked'));
    } else {
        bgMusic.pause();
    }
});

soundEffectsToggle.addEventListener('change', (e) => {
    gameState.audioSettings.soundEffectsEnabled = e.target.checked;
});

clearDataBtn.addEventListener('click', () => {
    if (confirm('هل أنت متأكد من حذف جميع البيانات؟')) {
        localStorage.clear();
        showToast('تم مسح جميع البيانات');
        closeSettings();
    }
});

// Modal settings
settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
        closeSettings();
    }
});

// ============================================
// Screen Management
// ============================================

function switchScreen(screenName) {
    Object.values(screens).forEach(screen => screen.classList.remove('active'));
    if (screens[screenName]) {
        screens[screenName].classList.add('active');
        gameState.currentScreen = screenName;
    }
}

function openSettings() {
    settingsModal.classList.add('active');
    playSound('click');
}

function closeSettings() {
    settingsModal.classList.remove('active');
}

// ============================================
// Game Logic
// ============================================

function startGame() {
    const playerName = playerNameInput.value.trim();
    
    if (!playerName) {
        showToast('⚠️ يرجى إدخال اسمك');
        return;
    }
    
    if (gameState.selectedCategory === '') {
        showToast('⚠️ يرجى اختيار فئة');
        return;
    }

    gameState.playerName = playerName;
    gameState.score = 0;
    gameState.correctAnswers = 0;
    gameState.currentQuestionIndex = 0;
    gameState.totalTime = 0;
    gameState.usedLifelines = {
        '50:50': false,
        'pause': false,
        'swap': false
    };
    gameState.timePaused = false;

    // تحميل الأسئلة من البنك
    gameState.questions = [...questionBank[gameState.selectedCategory]];
    
    // مزج الأسئلة عشوائياً
    shuffleArray(gameState.questions);
    
    // اختيار 10 أسئلة فقط
    gameState.questions = gameState.questions.slice(0, gameState.totalQuestions);

    switchScreen('game');
    showQuestion();
    playSound('click');

    // تحديث حالة الأدوات المساعدة
    updateLifelinesUI();
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function showQuestion() {
    if (gameState.currentQuestionIndex >= gameState.totalQuestions) {
        showResult();
        return;
    }

    const question = gameState.questions[gameState.currentQuestionIndex];
    gameState.questionStartTime = Date.now();
    gameState.currentTimer = 30;

    questionText.textContent = question.question;
    categoryTag.textContent = gameState.selectedCategory;
    questionNumber.textContent = `${gameState.currentQuestionIndex + 1}/${gameState.totalQuestions}`;
    scoreDisplay.textContent = gameState.score;
    updateProgressBar();

    // مزج الخيارات
    const options = [...question.options];
    shuffleArray(options);

    optionsGrid.innerHTML = '';
    options.forEach((option, index) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = option;
        
        // تحديد الإجابة الصحيحة بناءً على الخيار الأصلي
        const isCorrect = option === question.options[question.correct];
        
        btn.addEventListener('click', () => {
            selectAnswer(isCorrect, btn);
        });
        
        optionsGrid.appendChild(btn);
    });

    startTimer();
}

function startTimer() {
    gameState.timerInterval = setInterval(() => {
        if (!gameState.timePaused) {
            gameState.currentTimer--;
            timerDisplay.textContent = gameState.currentTimer;

            if (gameState.currentTimer <= 0) {
                clearInterval(gameState.timerInterval);
                selectAnswer(false, null);
            }
        }
    }, 1000);
}

function selectAnswer(isCorrect, button) {
    clearInterval(gameState.timerInterval);

    const timeSpent = 30 - gameState.currentTimer;
    gameState.totalTime += timeSpent;

    // تعطيل جميع الخيارات
    const allOptions = document.querySelectorAll('.option-btn');
    allOptions.forEach(opt => opt.disabled = true);

    // إظهار الإجابة الصحيحة
    if (isCorrect) {
        gameState.correctAnswers++;
        const points = Math.max(10 - Math.floor(timeSpent / 3), 5);
        gameState.score += points;
        
        if (button) button.classList.add('correct');
        playSound('correct');
        showToast(`✅ إجابة صحيحة! +${points} نقاط`);
    } else {
        if (button) button.classList.add('wrong');
        playSound('wrong');
        
        // إظهار الإجابة الصحيحة
        allOptions.forEach(opt => {
            if (opt.classList.contains('correct') === false && !opt.classList.contains('wrong')) {
                const question = gameState.questions[gameState.currentQuestionIndex];
                if (opt.textContent === question.options[question.correct]) {
                    opt.classList.add('correct');
                }
            }
        });
        
        showToast('❌ إجابة خاطئة');
    }

    setTimeout(() => {
        gameState.currentQuestionIndex++;
        showQuestion();
    }, 1500);
}

function updateProgressBar() {
    const progress = (gameState.currentQuestionIndex / gameState.totalQuestions) * 100;
    progressFill.style.width = progress + '%';
}

function apply50Lifeline() {
    gameState.usedLifelines['50:50'] = true;
    lifeline50Btn.disabled = true;
    
    const question = gameState.questions[gameState.currentQuestionIndex];
    const options = document.querySelectorAll('.option-btn');
    const wrongOptions = [];

    options.forEach((opt, index) => {
        if (opt.textContent !== question.options[question.correct]) {
            wrongOptions.push(opt);
        }
    });

    // حذف خيارين خاطئين عشوائياً
    for (let i = 0; i < Math.min(2, wrongOptions.length); i++) {
        const randomIndex = Math.floor(Math.random() * wrongOptions.length);
        wrongOptions[randomIndex].style.opacity = '0';
        wrongOptions[randomIndex].style.pointerEvents = 'none';
        wrongOptions.splice(randomIndex, 1);
    }

    showToast('✂️ تم حذف خيارين!');
    playSound('click');
    updateLifelinesUI();
}

function applyPauseLifeline() {
    gameState.usedLifelines['pause'] = true;
    lifelinePauseBtn.disabled = true;
    
    gameState.timePaused = true;
    const pauseTime = 10;
    let pauseCounter = pauseTime;

    showToast(`⏸️ الوقت متوقف لمدة ${pauseTime} ثانية!`);
    
    const pauseInterval = setInterval(() => {
        pauseCounter--;
        if (pauseCounter <= 0) {
            gameState.timePaused = false;
            clearInterval(pauseInterval);
        }
    }, 1000);

    playSound('click');
    updateLifelinesUI();
}

function applySwapLifeline() {
    gameState.usedLifelines['swap'] = true;
    lifelineSwapBtn.disabled = true;

    clearInterval(gameState.timerInterval);
    gameState.currentQuestionIndex++;
    showQuestion();

    showToast('🔄 تم تغيير السؤال!');
    playSound('click');
    updateLifelinesUI();
}

function updateLifelinesUI() {
    lifeline50Btn.disabled = gameState.usedLifelines['50:50'];
    lifelinePauseBtn.disabled = gameState.usedLifelines['pause'];
    lifelineSwapBtn.disabled = gameState.usedLifelines['swap'];
}

function confirmQuit() {
    if (confirm('هل تريد الخروج من اللعبة؟')) {
        switchScreen('home');
        clearInterval(gameState.timerInterval);
    }
}

// ============================================
// Result Screen
// ============================================

function showResult() {
    switchScreen('result');
    
    const percentage = Math.round((gameState.correctAnswers / gameState.totalQuestions) * 100);
    const avgTime = Math.round(gameState.totalTime / gameState.totalQuestions);

    let badge = '😢';
    let title = 'محاولة جديدة';
    let message = 'حاول مرة أخرى بجد أكثر!';

    if (percentage >= 80) {
        badge = '🎉';
        title = 'ممتاز جداً!';
        message = 'أداء عبقري!';
        playSound('correct');
    } else if (percentage >= 60) {
        badge = '👍';
        title = 'جيد!';
        message = 'أداء لائق!';
    } else if (percentage >= 40) {
        badge = '😊';
        title = 'حسناً';
        message = 'يمكنك تحسينه';
    }

    document.getElementById('resultBadge').textContent = badge;
    document.getElementById('resultTitle').textContent = title;
    document.getElementById('resultMessage').textContent = message;
    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('correctAnswers').textContent = `${gameState.correctAnswers}/${gameState.totalQuestions}`;
    document.getElementById('avgTime').textContent = avgTime + 's';

    // حفظ النتيجة في Firebase
    saveScoreToFirebase();

    // حفظ محلياً
    saveScoreLocally();
}

// ============================================
// Firebase Integration
// ============================================

async function saveScoreToFirebase() {
    if (!isFirebaseReady) {
        console.log('Firebase not configured');
        return;
    }

    try {
        await db.collection('leaderboard').add({
            name: gameState.playerName,
            category: gameState.selectedCategory,
            score: gameState.score,
            correctAnswers: gameState.correctAnswers,
            totalQuestions: gameState.totalQuestions,
            timestamp: new Date(),
            avgTime: Math.round(gameState.totalTime / gameState.totalQuestions)
        });
        console.log('Score saved to Firebase');
    } catch (error) {
        console.log('Firebase save error:', error);
    }
}

function saveScoreLocally() {
    const scores = JSON.parse(localStorage.getItem('quizScores') || '[]');
    scores.push({
        name: gameState.playerName,
        category: gameState.selectedCategory,
        score: gameState.score,
        correctAnswers: gameState.correctAnswers,
        totalQuestions: gameState.totalQuestions,
        timestamp: new Date().toISOString()
    });
    
    // الاحتفاظ بآخر 50 نتيجة فقط
    if (scores.length > 50) {
        scores.shift();
    }
    
    localStorage.setItem('quizScores', JSON.stringify(scores));
}

// ============================================
// Leaderboard
// ============================================

async function showLeaderboard() {
    switchScreen('leaderboard');
    playSound('click');
    
    const leaderboardList = document.getElementById('leaderboardList');
    leaderboardList.innerHTML = '<p class="loading">جاري التحميل...</p>';

    if (isFirebaseReady) {
        try {
            const snapshot = await db.collection('leaderboard')
                .orderBy('score', 'desc')
                .limit(10)
                .get();

            const scores = [];
            snapshot.forEach(doc => {
                scores.push(doc.data());
            });

            if (scores.length > 0) {
                displayLeaderboard(scores);
            } else {
                // عرض النتائج المحلية إذا كانت Firebase فارغة
                displayLocalLeaderboard();
            }
        } catch (error) {
            console.log('Leaderboard error:', error);
            displayLocalLeaderboard();
        }
    } else {
        displayLocalLeaderboard();
    }
}

function displayLeaderboard(scores) {
    const leaderboardList = document.getElementById('leaderboardList');
    leaderboardList.innerHTML = '';

    scores.forEach((score, index) => {
        const item = document.createElement('div');
        item.className = 'leaderboard-item';
        item.innerHTML = `
            <div class="leaderboard-rank">${index + 1}</div>
            <div class="leaderboard-name">${score.name}</div>
            <div class="leaderboard-score">${score.score}</div>
        `;
        leaderboardList.appendChild(item);
    });
}

function displayLocalLeaderboard() {
    const scores = JSON.parse(localStorage.getItem('quizScores') || '[]');
    const sorted = scores.sort((a, b) => b.score - a.score).slice(0, 10);

    const leaderboardList = document.getElementById('leaderboardList');
    leaderboardList.innerHTML = '';

    if (sorted.length === 0) {
        leaderboardList.innerHTML = '<p class="loading">لا توجد نتائج حتى الآن</p>';
        return;
    }

    sorted.forEach((score, index) => {
        const item = document.createElement('div');
        item.className = 'leaderboard-item';
        item.innerHTML = `
            <div class="leaderboard-rank">${index + 1}</div>
            <div class="leaderboard-name">${score.name}</div>
            <div class="leaderboard-score">${score.score}</div>
        `;
        leaderboardList.appendChild(item);
    });
}

// ============================================
// Toast Notifications
// ============================================

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

// ============================================
// Initialize
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Set default category
    gameState.selectedCategory = 'عام';
    categoryBtns[0].classList.add('active');

    // Setup audio
    setupAudio();

    // Try to play background music
    if (gameState.audioSettings.musicEnabled) {
        bgMusic.play().catch(e => console.log('Auto-play blocked'));
    }

    // Load saved settings
    const savedSettings = JSON.parse(localStorage.getItem('audioSettings') || '{}');
    if (Object.keys(savedSettings).length > 0) {
        gameState.audioSettings = { ...gameState.audioSettings, ...savedSettings };
        volumeSlider.value = gameState.audioSettings.volume;
        volumeValue.textContent = gameState.audioSettings.volume + '%';
        musicToggle.checked = gameState.audioSettings.musicEnabled;
        soundEffectsToggle.checked = gameState.audioSettings.soundEffectsEnabled;
    }

    console.log('Game initialized');
});

// حفظ الإعدادات
window.addEventListener('beforeunload', () => {
    localStorage.setItem('audioSettings', JSON.stringify(gameState.audioSettings));
});
