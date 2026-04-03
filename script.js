// ══════════════════════════════════════════
// متغيرات عامة
// ══════════════════════════════════════════
let gameState = {
    adminPassword: '1234',
    categories: [],
    questions: [],
    currentQuestion: 0,
    selectedAnswer: null,
    difficulty: 'easy',
    team1: { name: '', players: [], score: 0, currentPlayerIndex: 0 },
    team2: { name: '', players: [], score: 0, currentPlayerIndex: 0 },
    currentTeam: 1,
    soundEnabled: true
};

// ══════════════════════════════════════════
// تحميل البيانات من localStorage
// ══════════════════════════════════════════
function loadData() {
    const saved = localStorage.getItem('quizeriaData');
    if (saved) {
        const data = JSON.parse(saved);
        gameState.categories = data.categories || [];
        gameState.questions = data.questions || [];
    }
}

function saveData() {
    localStorage.setItem('quizeriaData', JSON.stringify({
        categories: gameState.categories,
        questions: gameState.questions
    }));
}

// ══════════════════════════════════════════
// إدارة الشاشات
// ══════════════════════════════════════════
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

// ══════════════════════════════════════════
// تطبيق الحزمة
// ══════════════════════════════════════════
const app = {
    // الذهاب للقائمة الرئيسية
    backToMenu() {
        document.getElementById('adminPassword').value = '';
        document.getElementById('passwordError').textContent = '';
        document.getElementById('passwordVerification').style.display = 'block';
        document.getElementById('adminControls').style.display = 'none';
        showScreen('mainMenu');
    },

    // فتح لوحة التحكم
    openAdminPanel() {
        showScreen('adminPanel');
        document.getElementById('adminPassword').focus();
    },

    // التحقق من كلمة السر
    verifyAdminPassword() {
        const password = document.getElementById('adminPassword').value;
        const errorEl = document.getElementById('passwordError');
        
        if (password === gameState.adminPassword) {
            errorEl.textContent = '';
            document.getElementById('passwordVerification').style.display = 'none';
            document.getElementById('adminControls').style.display = 'block';
            this.loadAdminData();
        } else {
            errorEl.textContent = '❌ كلمة السر غير صحيحة';
        }
    },

    // تحميل البيانات في لوحة التحكم
    loadAdminData() {
        this.loadCategories();
        this.loadQuestionsAdmin();
    },

    // تحميل الفئات في لوحة التحكم
    loadCategories() {
        const list = document.getElementById('categoriesListAdmin');
        const select = document.getElementById('categorySelect');
        
        list.innerHTML = '';
        select.innerHTML = '<option value="">-- اختر فئة --</option>';
        
        gameState.categories.forEach((cat, idx) => {
            // في القائمة
            const item = document.createElement('div');
            item.className = 'admin-item';
            item.innerHTML = `
                <div class="admin-item-text">
                    <strong style="color: var(--neon-yellow);">${cat}</strong>
                    <div style="font-size: 0.85rem; color: var(--dim); margin-top: 5px;">
                        ${gameState.questions.filter(q => q.category === cat).length} سؤال
                    </div>
                </div>
                <button class="delete-btn" onclick="app.deleteCategory('${cat}')">🗑️ حذف</button>
            `;
            list.appendChild(item);
            
            // في القائمة المنسدلة
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            select.appendChild(option);
        });
    },

    // إضافة فئة جديدة
    addCategory() {
        const name = document.getElementById('categoryName').value.trim();
        
        if (!name) {
            this.toast('❌ أدخل اسم الفئة');
            return;
        }
        
        if (gameState.categories.includes(name)) {
            this.toast('❌ الفئة موجودة بالفعل');
            return;
        }
        
        gameState.categories.push(name);
        saveData();
        document.getElementById('categoryName').value = '';
        this.loadCategories();
        this.toast('✅ تم إضافة الفئة');
    },

    // حذف فئة
    deleteCategory(catName) {
        if (!confirm(`هل أنت متأكد من حذف الفئة "${catName}" وجميع أسئلتها؟`)) return;
        
        gameState.categories = gameState.categories.filter(c => c !== catName);
        gameState.questions = gameState.questions.filter(q => q.category !== catName);
        saveData();
        this.loadCategories();
        this.loadQuestionsAdmin();
        this.toast('✅ تم حذف الفئة');
    },

    // تحميل الأسئلة في لوحة التحكم
    loadQuestionsAdmin() {
        const list = document.getElementById('questionsListAdmin');
        
        list.innerHTML = '';
        
        gameState.questions.forEach((q, idx) => {
            const item = document.createElement('div');
            item.className = 'admin-item';
            item.innerHTML = `
                <div class="admin-item-text">
                    <div class="admin-item-category">📁 ${q.category}</div>
                    <div class="admin-item-question"><strong>${q.question}</strong></div>
                    <div class="admin-item-options">
                        <div class="admin-item-option" style="border-left: 3px solid var(--neon-green);">✅ ${q.options[q.correctIndex]}</div>
                        ${q.options.map((opt, i) => i !== q.correctIndex ? `<div class="admin-item-option">❌ ${opt}</div>` : '').join('')}
                    </div>
                    <span class="admin-item-difficulty ${q.difficulty}">${q.difficulty === 'easy' ? '🟢 سهل' : q.difficulty === 'medium' ? '🟡 متوسط' : '🔴 صعب'}</span>
                </div>
                <button class="delete-btn" onclick="app.deleteQuestion(${idx})">🗑️</button>
            `;
            list.appendChild(item);
        });
    },

    // إضافة سؤال جديد
    addQuestion() {
        const category = document.getElementById('categorySelect').value;
        const question = document.getElementById('questionText').value.trim();
        const optA = document.getElementById('optionA').value.trim();
        const optB = document.getElementById('optionB').value.trim();
        const optC = document.getElementById('optionC').value.trim();
        const optD = document.getElementById('optionD').value.trim();
        const difficulty = document.getElementById('difficulty').value;
        
        if (!category) {
            this.toast('❌ اختر فئة');
            return;
        }
        
        if (!question || !optA || !optB || !optC || !optD) {
            this.toast('❌ أكمل جميع الحقول');
            return;
        }
        
        const q = {
            category: category,
            question: question,
            options: [optA, optB, optC, optD].sort(() => Math.random() - 0.5),
            correctIndex: [optA, optB, optC, optD].sort(() => Math.random() - 0.5).indexOf(optA),
            difficulty: difficulty
        };
        
        // إعادة حساب correctIndex بعد الترتيب العشوائي
        const opts = [optA, optB, optC, optD];
        const shuffled = opts.sort(() => Math.random() - 0.5);
        q.correctIndex = shuffled.indexOf(optA);
        q.options = shuffled;
        
        gameState.questions.push(q);
        saveData();
        
        document.getElementById('categorySelect').value = '';
        document.getElementById('questionText').value = '';
        document.getElementById('optionA').value = '';
        document.getElementById('optionB').value = '';
        document.getElementById('optionC').value = '';
        document.getElementById('optionD').value = '';
        document.getElementById('difficulty').value = 'medium';
        
        this.loadQuestionsAdmin();
        this.toast('✅ تم إضافة السؤال');
    },

    // حذف سؤال
    deleteQuestion(idx) {
        if (!confirm('هل أنت متأكد من حذف السؤال؟')) return;
        
        gameState.questions.splice(idx, 1);
        saveData();
        this.loadQuestionsAdmin();
        this.toast('✅ تم حذف السؤال');
    },

    // بدء إعدادات اللعبة
    startSetup() {
        if (gameState.categories.length === 0) {
            this.toast('❌ لا توجد فئات! أضف فئات في لوحة التحكم أولاً');
            return;
        }
        
        if (gameState.questions.length === 0) {
            this.toast('❌ لا توجد أسئلة! أضف أسئلة في لوحة التحكم أولاً');
            return;
        }
        
        // تحميل الفئات في القائمة المنسدلة
        const select = document.getElementById('categoryGameSelect');
        select.innerHTML = '<option value="">-- اختر فئة --</option>';
        gameState.categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            select.appendChild(option);
        });
        
        // تعيين مستويات الصعوبة
        document.querySelectorAll('.diff-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector('[data-level="easy"]').classList.add('active');
        gameState.difficulty = 'easy';
        
        // معالجات أزرار الصعوبة
        document.querySelectorAll('.diff-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                gameState.difficulty = btn.dataset.level;
            });
        });
        
        showScreen('setup');
    },

    // بدء اللعبة
    startGame() {
        const team1Name = document.getElementById('team1Name').value || 'الفريق الأول';
        const team2Name = document.getElementById('team2Name').value || 'الفريق الثاني';
        const teamSize = parseInt(document.getElementById('teamSize').value) || 3;
        const category = document.getElementById('categoryGameSelect').value;
        const qCount = parseInt(document.getElementById('questionCount').value) || 5;
        
        if (!category) {
            this.toast('❌ اختر فئة');
            return;
        }
        
        // فلترة الأسئلة حسب الفئة والصعوبة
        let categoryQuestions = gameState.questions.filter(q => q.category === category && q.difficulty === gameState.difficulty);
        
        if (categoryQuestions.length === 0) {
            this.toast('❌ لا توجد أسئلة في هذه الفئة ومستوى الصعوبة');
            return;
        }
        
        // اختيار عشوائي من الأسئلة
        categoryQuestions = categoryQuestions.sort(() => Math.random() - 0.5).slice(0, Math.min(qCount, categoryQuestions.length));
        
        gameState.team1.name = '🔴 ' + team1Name;
        gameState.team2.name = '🔵 ' + team2Name;
        gameState.team1.players = Array.from({ length: teamSize }, (_, i) => `${team1Name} ${i + 1}`);
        gameState.team2.players = Array.from({ length: teamSize }, (_, i) => `${team2Name} ${i + 1}`);
        gameState.team1.score = 0;
        gameState.team2.score = 0;
        gameState.team1.currentPlayerIndex = 0;
        gameState.team2.currentPlayerIndex = 0;
        gameState.currentTeam = 1;
        gameState.questions = categoryQuestions;
        gameState.currentQuestion = 0;
        
        this.displayQuestion();
        showScreen('game');
    },

    // عرض السؤال
    displayQuestion() {
        if (gameState.currentQuestion >= gameState.questions.length) {
            this.endGame();
            return;
        }
        
        const q = gameState.questions[gameState.currentQuestion];
        const diffMap = { easy: 'سهل 🟢', medium: 'متوسط 🟡', hard: 'صعب 🔴' };
        
        document.getElementById('questionText').textContent = q.question;
        document.getElementById('qNum').textContent = gameState.currentQuestion + 1;
        document.getElementById('qTotal').textContent = gameState.questions.length;
        document.getElementById('diffBadge').textContent = diffMap[q.difficulty];
        document.getElementById('diffBadge').className = `difficulty-badge ${q.difficulty}`;
        
        // عرض أسماء الفريقين
        document.getElementById('team1NameDisplay').textContent = gameState.team1.name;
        document.getElementById('team2NameDisplay').textContent = gameState.team2.name;
        
        // عرض النقاط
        document.getElementById('team1Score').textContent = gameState.team1.score;
        document.getElementById('team2Score').textContent = gameState.team2.score;
        
        // عرض لاعب الفريق الحالي (اختيار عشوائي)
        const currentTeam = gameState.currentTeam === 1 ? gameState.team1 : gameState.team2;
        const randomPlayerIndex = Math.floor(Math.random() * currentTeam.players.length);
        currentTeam.currentPlayerIndex = randomPlayerIndex;
        
        if (gameState.currentTeam === 1) {
            document.getElementById('team1CurrentPlayer').textContent = '👤 ' + currentTeam.players[randomPlayerIndex];
            document.getElementById('team2CurrentPlayer').textContent = '';
        } else {
            document.getElementById('team2CurrentPlayer').textContent = '👤 ' + currentTeam.players[randomPlayerIndex];
            document.getElementById('team1CurrentPlayer').textContent = '';
        }
        
        // عرض الخيارات
        const container = document.getElementById('optionsContainer');
        container.innerHTML = '';
        
        q.options.forEach((opt, i) => {
            const btn = document.createElement('button');
            btn.className = 'option';
            btn.textContent = opt;
            btn.onclick = () => this.selectAnswer(i);
            container.appendChild(btn);
        });
        
        gameState.selectedAnswer = null;
        document.getElementById('passBtn').style.display = 'block';
        document.getElementById('nextBtn').style.display = 'none';
    },

    // اختيار إجابة
    selectAnswer(index) {
        if (gameState.selectedAnswer !== null) return;
        
        gameState.selectedAnswer = index;
        const q = gameState.questions[gameState.currentQuestion];
        const options = document.querySelectorAll('.option');
        
        options.forEach((opt, i) => {
            opt.classList.add('disabled');
            if (i === q.correctIndex) opt.classList.add('correct');
            if (i === index && i !== q.correctIndex) opt.classList.add('wrong');
        });
        
        if (index === q.correctIndex) {
            gameState.currentTeam === 1 ? gameState.team1.score++ : gameState.team2.score++;
            this.toast('✅ إجابة صحيحة! +1 نقطة');
            this.nextTeam();
        } else {
            this.toast('❌ إجابة خاطئة! نتقل للفريق الآخر');
            this.switchTeam();
        }
        
        document.getElementById('team1Score').textContent = gameState.team1.score;
        document.getElementById('team2Score').textContent = gameState.team2.score;
        
        document.getElementById('passBtn').style.display = 'none';
        document.getElementById('nextBtn').style.display = 'block';
    },

    // تبديل الفريق
    switchTeam() {
        gameState.currentTeam = gameState.currentTeam === 1 ? 2 : 1;
    },

    // انتقال للفريق التالي
    nextTeam() {
        gameState.currentTeam = gameState.currentTeam === 1 ? 2 : 1;
    },

    // السؤال التالي
    nextQuestion() {
        gameState.currentQuestion++;
        gameState.selectedAnswer = null;
        
        if (gameState.currentQuestion >= gameState.questions.length) {
            this.endGame();
        } else {
            this.displayQuestion();
        }
    },

    // تمرير السؤال
    passQuestion() {
        this.switchTeam();
        this.toast('⏭️ تم التمرير للفريق الآخر');
        
        const q = gameState.questions[gameState.currentQuestion];
        const options = document.querySelectorAll('.option');
        
        options.forEach((opt, i) => {
            opt.classList.add('disabled');
            if (i === q.correctIndex) opt.classList.add('correct');
        });
        
        document.getElementById('passBtn').style.display = 'none';
        document.getElementById('nextBtn').style.display = 'block';
    },

    // نهاية اللعبة
    endGame() {
        const winner = gameState.team1.score > gameState.team2.score ? gameState.team1 : gameState.team2;
        const isDraw = gameState.team1.score === gameState.team2.score;
        
        document.getElementById('resultTitle').textContent = isDraw ? '🤝 تعادل!' : '🎉 ' + winner.name + ' فاز!';
        document.getElementById('resultText').textContent = `${gameState.team1.name}: ${gameState.team1.score} نقطة | ${gameState.team2.name}: ${gameState.team2.score} نقطة`;
        document.getElementById('finalTeam1Name').textContent = gameState.team1.name;
        document.getElementById('finalTeam1Score').textContent = gameState.team1.score;
        document.getElementById('finalTeam2Name').textContent = gameState.team2.name;
        document.getElementById('finalTeam2Score').textContent = gameState.team2.score;
        
        showScreen('result');
    },

    // الخروج من اللعبة
    exitGame() {
        if (confirm('هل تريد الخروج من اللعبة؟')) {
            this.backToMenu();
        }
    },

    // إظهار رسالة
    toast(msg) {
        const t = document.createElement('div');
        t.className = 'toast';
        t.textContent = msg;
        document.body.appendChild(t);
        setTimeout(() => t.remove(), 3000);
    }
};

// ══════════════════════════════════════════
// تحميل البيانات عند بدء الصفحة
// ══════════════════════════════════════════
window.addEventListener('load', () => {
    loadData();
});
