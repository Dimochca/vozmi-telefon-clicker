// Состояние игры
let game = {
    balance: 0,
    totalEarnedAllTime: 0,
    totalEarnedThisPrestige: 0,
    totalClicks: 0,
    clickPower: 1,
    autoIncome: 0,
    critChance: 0,
    critMultiplier: 2,
    comboDuration: 1,
    shopDiscount: 0,
    autoPower: 0,
    critPrestigeBonus: 0,

    clickLevel: 0,
    autoLevel: 0,
    critChanceLevel: 0,
    critMultiplierLevel: 0,
    comboLevel: 0,
    discountLevel: 0,
    autoPowerLevel: 0,
    critPrestigeLevel: 0,

    clickUpgradeCost: 20,
    autoUpgradeCost: 100,
    critChanceUpgradeCost: 200,
    critMultiplierUpgradeCost: 400,
    comboUpgradeCost: 300,
    discountUpgradeCost: 600,
    autoPowerUpgradeCost: 800,
    critPrestigeUpgradeCost: 1000,

    prestige: 0,
    prestigeIncomeBonus: 0,
    prestigeDiscount: 0,
    prestigeCurrency: 0,

    permAutoSpeed: 0,
    permIncomeMultiplier: 0,
    permDiscount: 0,
    permAutoPower: 0,
    permCritMultiplier: 0,

    globalPrestigeCurrency: 0,
    globalIncomeMultiplier: 0,
    globalDiscountMultiplier: 0,

    combo: 0,
    lastClickTime: 0,
    comboDecayInterval: null,

    timePlayed: 0,
    lastSaveTime: Date.now(),

    soundEnabled: true,
    musicEnabled: false,
    autoPrestigeEnabled: false,
    autoBuyActive: false
};

// Элементы DOM
const balanceEl = document.getElementById('balance');
const clickHint = document.getElementById('clickHint');
const clickBtn = document.getElementById('clickButton');
const soundToggle = document.getElementById('soundToggleBtn');
const musicToggle = document.getElementById('musicToggleBtn');
const autoBuyToggle = document.getElementById('autoBuyToggle');
const autoPrestigeToggle = document.getElementById('autoPrestigeToggle');
const autoBuyNew = document.getElementById('autoBuyNew');
const autoPrestigeNew = document.getElementById('autoPrestigeNew');
const prestigeBtn = document.getElementById('prestigeBtn');
const globalPrestigeBtn = document.getElementById('globalPrestigeBtn');
const prestigeModal = document.getElementById('prestigeModal');
const globalPrestigeModal = document.getElementById('globalPrestigeModal');
const modalYes = document.getElementById('modalYes');
const modalNo = document.getElementById('modalNo');
const globalModalYes = document.getElementById('globalModalYes');
const globalModalNo = document.getElementById('globalModalNo');
const tabNormal = document.getElementById('tabNormal');
const tabPrestige = document.getElementById('tabPrestige');
const tabGlobal = document.getElementById('tabGlobal');
const upgradesGrid = document.getElementById('upgradesGrid');
const prestigeGrid = document.getElementById('prestigeGrid');
const globalGrid = document.getElementById('globalGrid');

const prestigeLevelSpan = document.getElementById('prestigeLevel');
const prestigeIncomeBonusSpan = document.getElementById('prestigeIncomeBonus');
const prestigeDiscountSpan = document.getElementById('prestigeDiscount');
const prestigeProgressSpan = document.getElementById('prestigeProgress');
const prestigeGoalSpan = document.getElementById('prestigeGoal');
const prestigeCurrencySpan = document.getElementById('prestigeCurrency');
const globalCurrencySpan = document.getElementById('globalCurrency');
const prestigeCurrencyContainer = document.getElementById('prestigeCurrencyContainer');
const globalCurrencyContainer = document.getElementById('globalCurrencyContainer');
const prestigeBarFill = document.getElementById('prestigeBarFill');
const statTime = document.getElementById('statTime');
const statTotalClicks = document.getElementById('statTotalClicks');
const statPrestigeEarned = document.getElementById('statPrestigeEarned');
const statAllTimeEarned = document.getElementById('statAllTimeEarned');
const comboIndicator = document.getElementById('comboIndicator');

// Аудио
const clickLoopSound = document.getElementById('clickLoopSound');
const prestigeSound = document.getElementById('prestigeSound');
const bgMusic = document.getElementById('bgMusic');

let autoBuyInterval = null;
let autoPrestigeInterval = null;

// Данные для обычных улучшений
const upgrades = [
    { id: 'click', name: '📞 Сила голоса', desc: 'Звонков за клик', baseCost: 20, costMult: 1.4,
      getEffect: () => game.clickPower, effectUnit: '',
      getNext: (lvl) => lvl + 1 },
    { id: 'auto', name: '⏰ Автодозвон', desc: 'Зв./сек', baseCost: 100, costMult: 1.5,
      getEffect: () => game.autoIncome, effectUnit: '/сек',
      getNext: (lvl) => lvl + 1 },
    { id: 'critChance', name: '💥 Шанс крита', desc: 'Шанс x2', baseCost: 200, costMult: 1.6,
      getEffect: () => game.critChance, effectUnit: '%',
      getNext: (lvl) => Math.min(lvl + 1, 50) },
    { id: 'critMultiplier', name: '🔥 Сила крита', desc: 'Множитель', baseCost: 400, costMult: 1.7,
      getEffect: () => game.critMultiplier, effectUnit: 'x',
      getNext: (lvl) => 2 + lvl * 0.5 },
    { id: 'combo', name: '⚡ Длина комбо', desc: 'Секунд на комбо', baseCost: 300, costMult: 1.5,
      getEffect: () => game.comboDuration, effectUnit: 'сек',
      getNext: (lvl) => 1 + lvl * 1 },
    { id: 'discount', name: '🏷 Скидка', desc: '% на всё', baseCost: 600, costMult: 1.8,
      getEffect: () => game.shopDiscount, effectUnit: '%',
      getNext: (lvl) => lvl * 1 },
    { id: 'autoPower', name: '🚀 Усиление автодозвона', desc: 'Множитель', baseCost: 800, costMult: 2.0,
      getEffect: () => game.autoPower, effectUnit: 'x',
      getNext: (lvl) => 1 + lvl * 0.5 },
    { id: 'critPrestige', name: '👑 Крит престижа', desc: '+к множителю крита', baseCost: 1000, costMult: 2.2,
      getEffect: () => game.critPrestigeBonus, effectUnit: '',
      getNext: (lvl) => lvl * 0.1 }
];

// Данные для престиж-улучшений
const permUpgrades = [
    { id: 'permAutoSpeed', name: '⚡ Скорость автопокупки', desc: 'Уменьшает интервал (мин. 0.2с)',
      getEffect: () => game.permAutoSpeed, effectUnit: 'ур.',
      getNext: (lvl) => `${Math.max(200, 800 - lvl * 50)} мс` },
    { id: 'permIncomeMultiplier', name: '💰 Множитель дохода', desc: '+5% к доходу',
      getEffect: () => game.permIncomeMultiplier, effectUnit: 'ур.',
      getNext: (lvl) => `+${lvl * 5}%` },
    { id: 'permDiscount', name: '🏷 Постоянная скидка', desc: '+1% к скидке',
      getEffect: () => game.permDiscount, effectUnit: '%',
      getNext: (lvl) => `+${lvl}%` },
    { id: 'permAutoPower', name: '🚀 Усиление автодозвона', desc: '+0.2 к множителю',
      getEffect: () => game.permAutoPower, effectUnit: 'ур.',
      getNext: (lvl) => `+${lvl * 0.2}x` },
    { id: 'permCritMultiplier', name: '💥 Сила крита', desc: '+0.1 к множителю крита',
      getEffect: () => game.permCritMultiplier, effectUnit: 'ур.',
      getNext: (lvl) => `+${lvl * 0.1}` }
];

// Данные для глобальных улучшений
const globalUpgrades = [
    { id: 'globalIncomeMultiplier', name: '💰 Усиление дохода престижа', desc: '+5% к бонусу дохода за уровень',
      getEffect: () => game.globalIncomeMultiplier, effectUnit: 'ур.',
      getNext: (lvl) => `+${lvl * 5}%` },
    { id: 'globalDiscountMultiplier', name: '🏷 Усиление скидки престижа', desc: '+1% к скидке престижа за уровень',
      getEffect: () => game.globalDiscountMultiplier, effectUnit: 'ур.',
      getNext: (lvl) => `+${lvl}%` }
];

// Инициализация SDK Яндекс.Игр
window.initSDK = async function() {
    if (typeof YaGames === 'undefined') return;
    try {
        window.ysdk = await YaGames.init();
        console.log('SDK инициализирован');
        // Загружаем сохранение из облака
        const playerData = await ysdk.getPlayerData();
        if (playerData && playerData.game) {
            try {
                const parsed = JSON.parse(playerData.game);
                game = { ...game, ...parsed };
                updatePrestigeBonuses();
                updateUI();
                updateComboSound();
            } catch (e) {}
        }
    } catch (e) {
        console.error('Ошибка инициализации SDK:', e);
    }
};

// Загрузка (с приоритетом SDK)
async function loadGame() {
    if (window.ysdk) {
        try {
            const playerData = await ysdk.getPlayerData();
            if (playerData && playerData.game) {
                const parsed = JSON.parse(playerData.game);
                game = { ...game, ...parsed };
                updatePrestigeBonuses();
                updateUI();
                updateComboSound();
                return;
            }
        } catch (e) {}
    }
    // Fallback на localStorage
    const saved = localStorage.getItem('toxixClickerV5');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            game = { ...game, ...parsed };
        } catch (e) {}
    }
    updatePrestigeBonuses();
    updateUI();
    updateComboSound();
}

// Сохранение
async function saveGame() {
    if (window.ysdk) {
        try {
            await ysdk.setPlayerData({ game: JSON.stringify(game) });
        } catch (e) {}
    } else {
        localStorage.setItem('toxixClickerV5', JSON.stringify(game));
    }
}

// Обновление бонусов престижа
function updatePrestigeBonuses() {
    game.prestigeIncomeBonus = game.prestige * 10 * (1 + game.globalIncomeMultiplier * 0.05);
    game.prestigeDiscount = game.prestige * 1 * (1 + game.globalDiscountMultiplier * 0.01);
}

// Цель престижа
function getPrestigeGoal() {
    return 1000 * (game.prestige + 1);
}

// Общая скидка
function getTotalDiscount() {
    return game.prestigeDiscount + game.shopDiscount + game.permDiscount;
}

// Цена со скидкой
function getDiscountedCost(upgradeId) {
    const costField = upgradeId + 'UpgradeCost';
    let cost = game[costField];
    let totalDiscount = getTotalDiscount();
    if (totalDiscount > 100) totalDiscount = 100;
    cost = Math.floor(cost * (1 - totalDiscount / 100));
    return Math.max(0, cost);
}

// Стоимость престиж-улучшения
function getPermUpgradeCost(id) {
    return (game[id] || 0) + 1;
}

// Обновление интерфейса
function updateUI() {
    balanceEl.textContent = Math.floor(game.balance);
    prestigeLevelSpan.textContent = game.prestige;
    prestigeIncomeBonusSpan.textContent = game.prestigeIncomeBonus.toFixed(1);
    prestigeDiscountSpan.textContent = game.prestigeDiscount.toFixed(1);

    if (game.prestigeCurrency > 0) {
        prestigeCurrencyContainer.style.display = 'block';
        prestigeCurrencySpan.textContent = game.prestigeCurrency;
    } else {
        prestigeCurrencyContainer.style.display = 'none';
    }
    if (game.globalPrestigeCurrency > 0) {
        globalCurrencyContainer.style.display = 'block';
        globalCurrencySpan.textContent = game.globalPrestigeCurrency;
    } else {
        globalCurrencyContainer.style.display = 'none';
    }

    const goal = getPrestigeGoal();
    prestigeGoalSpan.textContent = goal;
    const progress = Math.min(game.totalEarnedThisPrestige, goal);
    prestigeProgressSpan.textContent = Math.floor(progress);
    const percent = (progress / goal) * 100;
    prestigeBarFill.style.width = percent + '%';
    prestigeBtn.style.display = game.totalEarnedThisPrestige >= goal ? 'block' : 'none';

    if (getTotalDiscount() >= 100) {
        globalPrestigeBtn.style.display = 'block';
    } else {
        globalPrestigeBtn.style.display = 'none';
    }

    statTotalClicks.textContent = game.totalClicks;
    statPrestigeEarned.textContent = Math.floor(game.totalEarnedThisPrestige);
    statAllTimeEarned.textContent = Math.floor(game.totalEarnedAllTime);

    comboIndicator.textContent = game.combo > 0 ? `x${(1 + game.combo * 0.1).toFixed(1)} комбо` : '';

    // Автопокупка
    if (game.prestige > 0) {
        autoBuyToggle.disabled = false;
        autoBuyToggle.textContent = game.autoBuyActive ? '🤖 Автопокупка вкл.' : '🤖 Автопокупка выкл.';
        autoBuyNew.style.display = (!game.autoBuyActive && !autoBuyToggle.disabled) ? 'inline' : 'none';
    } else {
        autoBuyToggle.disabled = true;
        autoBuyToggle.textContent = '🤖 Автопокупка (нужен престиж)';
        autoBuyNew.style.display = 'none';
        if (game.autoBuyActive) {
            game.autoBuyActive = false;
            clearInterval(autoBuyInterval);
        }
    }

    // Автопрестиж
    if (game.prestige >= 3) {
        autoPrestigeToggle.disabled = false;
        autoPrestigeToggle.textContent = game.autoPrestigeEnabled ? '⚡ Автопрестиж вкл.' : '⚡ Автопрестиж выкл.';
        autoPrestigeNew.style.display = (!game.autoPrestigeEnabled && !autoPrestigeToggle.disabled) ? 'inline' : 'none';
    } else {
        autoPrestigeToggle.disabled = true;
        autoPrestigeToggle.textContent = '⚡ Автопрестиж (с 3 престижа)';
        autoPrestigeNew.style.display = 'none';
        if (game.autoPrestigeEnabled) {
            game.autoPrestigeEnabled = false;
            clearInterval(autoPrestigeInterval);
        }
    }

    tabPrestige.style.display = game.prestige > 0 ? 'inline-block' : 'none';
    tabGlobal.style.display = game.globalPrestigeCurrency > 0 ? 'inline-block' : 'none';

    if (tabNormal.classList.contains('active')) {
        renderUpgrades(upgradesGrid, upgrades);
    } else if (tabPrestige.classList.contains('active') && game.prestige > 0) {
        renderPermUpgrades(prestigeGrid);
    } else if (tabGlobal.classList.contains('active') && game.globalPrestigeCurrency > 0) {
        renderGlobalUpgrades(globalGrid);
    }
}

function renderUpgrades(grid, list) {
    let html = '';
    list.forEach(upg => {
        const level = game[upg.id + 'Level'] || 0;
        const cost = getDiscountedCost(upg.id);
        const effect = upg.getEffect();
        let effectStr = effect;
        if (typeof effect === 'number' && !Number.isInteger(effect)) effectStr = effect.toFixed(1);

        html += `
            <div class="upgrade">
                <div class="upgrade-info">
                    <span class="upgrade-name">${upg.name}</span>
                    <span class="upgrade-desc">${upg.desc}</span>
                </div>
                <div class="upgrade-stats">
                    <span>${effectStr}${upg.effectUnit}</span>
                    <span class="upgrade-cost">${cost} зв.</span>
                </div>
                <button class="buy-btn" data-id="${upg.id}" ${game.balance < cost ? 'disabled' : ''}>Купить</button>
            </div>
        `;
    });
    grid.innerHTML = html;
    grid.querySelectorAll('.buy-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            buyUpgrade(id);
        });
    });
}

function renderPermUpgrades(grid) {
    let html = '';
    permUpgrades.forEach(upg => {
        const level = game[upg.id] || 0;
        const cost = getPermUpgradeCost(upg.id);
        const nextDesc = upg.getNext(level + 1);

        html += `
            <div class="upgrade">
                <div class="upgrade-info">
                    <span class="upgrade-name">${upg.name}</span>
                    <span class="upgrade-desc">${upg.desc}</span>
                </div>
                <div class="upgrade-stats">
                    <span>Ур. ${level}</span>
                    <span class="upgrade-cost">${cost} 💎</span>
                </div>
                <button class="buy-btn perm-buy" data-id="${upg.id}" ${game.prestigeCurrency < cost ? 'disabled' : ''}>Купить (${nextDesc})</button>
            </div>
        `;
    });
    grid.innerHTML = html;
    grid.querySelectorAll('.perm-buy').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            buyPermUpgrade(id);
        });
    });
}

function renderGlobalUpgrades(grid) {
    let html = '';
    globalUpgrades.forEach(upg => {
        const level = game[upg.id] || 0;
        const cost = 1;
        const nextDesc = upg.getNext(level + 1);

        html += `
            <div class="upgrade">
                <div class="upgrade-info">
                    <span class="upgrade-name">${upg.name}</span>
                    <span class="upgrade-desc">${upg.desc}</span>
                </div>
                <div class="upgrade-stats">
                    <span>Ур. ${level}</span>
                    <span class="upgrade-cost">${cost} 🔮</span>
                </div>
                <button class="buy-btn global-buy" data-id="${upg.id}" ${game.globalPrestigeCurrency < cost ? 'disabled' : ''}>Купить (${nextDesc})</button>
            </div>
        `;
    });
    grid.innerHTML = html;
    grid.querySelectorAll('.global-buy').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            buyGlobalUpgrade(id);
        });
    });
}

function buyUpgrade(id) {
    const upg = upgrades.find(u => u.id === id);
    if (!upg) return;
    const cost = getDiscountedCost(id);
    if (game.balance < cost) return;

    game.balance -= cost;
    const levelField = id + 'Level';
    game[levelField]++;

    switch(id) {
        case 'click': game.clickPower++; break;
        case 'auto': game.autoIncome++; break;
        case 'critChance': game.critChance = Math.min(game.critChance + 1, 50); break;
        case 'critMultiplier': game.critMultiplier = 2 + game.critMultiplierLevel * 0.5; break;
        case 'combo': game.comboDuration = 1 + game.comboLevel * 1; break;
        case 'discount': game.shopDiscount = game.discountLevel * 1; break;
        case 'autoPower': game.autoPower = 1 + game.autoPowerLevel * 0.5; break;
        case 'critPrestige': game.critPrestigeBonus = game.critPrestigeLevel * 0.1; break;
    }

    const costField = id + 'UpgradeCost';
    game[costField] = Math.floor(game[costField] * upg.costMult);

    saveGame();
    updateUI();
    showHint('Куплено!');
}

function buyPermUpgrade(id) {
    const cost = getPermUpgradeCost(id);
    if (game.prestigeCurrency < cost) return;
    game.prestigeCurrency -= cost;
    game[id]++;

    saveGame();
    updateUI();
    showHint('Улучшено навсегда!');
}

function buyGlobalUpgrade(id) {
    const cost = 1;
    if (game.globalPrestigeCurrency < cost) return;
    game.globalPrestigeCurrency -= cost;
    game[id]++;
    updatePrestigeBonuses();

    saveGame();
    updateUI();
    showHint('Глобальное улучшение!');
}

function calculateClickIncome() {
    let base = game.clickPower;
    base *= (1 + game.prestigeIncomeBonus / 100);
    base *= (1 + game.permIncomeMultiplier * 0.05);
    if (game.combo > 0) {
        base *= (1 + game.combo * 0.1);
    }
    let critMult = game.critMultiplier + game.critPrestigeBonus + game.permCritMultiplier;
    if (game.critChance > 0) {
        let roll = Math.random() * 100;
        if (roll < game.critChance) {
            base *= critMult;
            showHint('КРИТ! x' + critMult.toFixed(1));
        }
    }
    return Math.floor(base);
}

// Клик
clickBtn.addEventListener('click', (e) => {
    const now = Date.now();
    if (now - game.lastClickTime < game.comboDuration * 1000) {
        game.combo = Math.min(game.combo + 1, 10);
    } else {
        game.combo = 1;
    }
    game.lastClickTime = now;

    const income = calculateClickIncome();
    game.balance += income;
    game.totalEarnedThisPrestige += income;
    game.totalEarnedAllTime += income;
    game.totalClicks++;

    updateComboSound();
    updateUI();
    saveGame();
    showHint(`+${income} зв.`);
});

function startComboDecay() {
    if (game.comboDecayInterval) clearInterval(game.comboDecayInterval);
    game.comboDecayInterval = setInterval(() => {
        if (game.combo > 0) {
            const now = Date.now();
            if (now - game.lastClickTime > game.comboDuration * 1000) {
                game.combo = 0;
                updateComboSound();
                updateUI();
            }
        }
    }, 500);
}

function updateComboSound() {
    if (!game.soundEnabled) {
        clickLoopSound.pause();
        clickLoopSound.currentTime = 0;
        return;
    }
    if (game.combo > 0) {
        clickLoopSound.play().catch(() => {});
    } else {
        clickLoopSound.pause();
        clickLoopSound.currentTime = 0;
    }
}

function startTimeCounter() {
    setInterval(() => {
        game.timePlayed++;
        const mins = Math.floor(game.timePlayed / 60);
        const secs = game.timePlayed % 60;
        statTime.textContent = `${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`;
        saveGame();
    }, 1000);
}

// Автодоход
setInterval(() => {
    if (game.autoIncome > 0) {
        let auto = game.autoIncome;
        auto *= (1 + game.prestigeIncomeBonus / 100);
        auto *= (1 + game.permIncomeMultiplier * 0.05);
        if (game.autoPower > 0) auto *= game.autoPower;
        if (game.permAutoPower > 0) auto *= (1 + game.permAutoPower * 0.2);
        game.balance += auto;
        game.totalEarnedThisPrestige += auto;
        game.totalEarnedAllTime += auto;
        updateUI();
        saveGame();
    }
}, 1000);

// Сброс прогресса престижа (используется при обычном и глобальном престиже)
function resetPrestigeProgress() {
    game.balance = 0;
    game.totalEarnedThisPrestige = 0;
    game.clickPower = 1;
    game.autoIncome = 0;
    game.critChance = 0;
    game.critMultiplier = 2;
    game.comboDuration = 1;
    game.shopDiscount = 0;
    game.autoPower = 0;
    game.critPrestigeBonus = 0;
    game.clickLevel = 0;
    game.autoLevel = 0;
    game.critChanceLevel = 0;
    game.critMultiplierLevel = 0;
    game.comboLevel = 0;
    game.discountLevel = 0;
    game.autoPowerLevel = 0;
    game.critPrestigeLevel = 0;
    game.clickUpgradeCost = 20;
    game.autoUpgradeCost = 100;
    game.critChanceUpgradeCost = 200;
    game.critMultiplierUpgradeCost = 400;
    game.comboUpgradeCost = 300;
    game.discountUpgradeCost = 600;
    game.autoPowerUpgradeCost = 800;
    game.critPrestigeUpgradeCost = 1000;
    saveGame();
    updateUI();
}

// Обычный престиж
prestigeBtn.addEventListener('click', () => {
    prestigeModal.style.display = 'flex';
});

modalYes.addEventListener('click', () => {
    const goal = getPrestigeGoal();
    if (game.totalEarnedThisPrestige >= goal) {
        game.prestige++;
        game.prestigeCurrency++;
        updatePrestigeBonuses();
        resetPrestigeProgress();
        playSound('prestige');
        updateUI();
        showHint('ПРЕСТИЖ!');
    }
    prestigeModal.style.display = 'none';
});

modalNo.addEventListener('click', () => {
    prestigeModal.style.display = 'none';
});

// Глобальный престиж
globalPrestigeBtn.addEventListener('click', () => {
    globalPrestigeModal.style.display = 'flex';
});

globalModalYes.addEventListener('click', () => {
    if (getTotalDiscount() >= 100) {
        game.globalPrestigeCurrency++;
        game.prestige = 0;
        game.prestigeCurrency = 0;
        game.permAutoSpeed = 0;
        game.permIncomeMultiplier = 0;
        game.permDiscount = 0;
        game.permAutoPower = 0;
        game.permCritMultiplier = 0;
        updatePrestigeBonuses();
        resetPrestigeProgress();
        playSound('prestige');
        updateUI();
        showHint('ГЛОБАЛЬНЫЙ ПРЕСТИЖ!');
    }
    globalPrestigeModal.style.display = 'none';
});

globalModalNo.addEventListener('click', () => {
    globalPrestigeModal.style.display = 'none';
});

// Звук и музыка
soundToggle.addEventListener('click', () => {
    game.soundEnabled = !game.soundEnabled;
    soundToggle.textContent = game.soundEnabled ? '🔊 Звук' : '🔇 Звук';
    if (!game.soundEnabled) {
        clickLoopSound.pause();
        clickLoopSound.currentTime = 0;
        if (game.musicEnabled) {
            bgMusic.pause();
        }
    } else {
        if (game.musicEnabled) {
            bgMusic.play().catch(() => {});
        }
        if (game.combo > 0) {
            clickLoopSound.play().catch(() => {});
        }
    }
    saveGame();
});

musicToggle.addEventListener('click', () => {
    game.musicEnabled = !game.musicEnabled;
    musicToggle.textContent = game.musicEnabled ? '🎵 Музыка вкл' : '🎵 Музыка выкл';
    if (game.musicEnabled) {
        if (game.soundEnabled) bgMusic.play().catch(() => {});
    } else {
        bgMusic.pause();
    }
    saveGame();
});

function playSound(type) {
    if (!game.soundEnabled) return;
    if (type === 'prestige') {
        prestigeSound.currentTime = 0;
        prestigeSound.play().catch(() => {});
    }
}

// Автопокупка
autoBuyToggle.addEventListener('click', () => {
    if (game.prestige === 0) return;
    game.autoBuyActive = !game.autoBuyActive;
    if (game.autoBuyActive) {
        autoBuyToggle.classList.add('active');
        const intervalTime = Math.max(200, 800 - game.permAutoSpeed * 50);
        if (autoBuyInterval) clearInterval(autoBuyInterval);
        autoBuyInterval = setInterval(() => {
            if (!game.autoBuyActive) return;
            for (let upg of upgrades) {
                const cost = getDiscountedCost(upg.id);
                if (game.balance >= cost) {
                    buyUpgrade(upg.id);
                    break;
                }
            }
        }, intervalTime);
    } else {
        autoBuyToggle.classList.remove('active');
        clearInterval(autoBuyInterval);
    }
    updateUI();
});

// Автопрестиж
autoPrestigeToggle.addEventListener('click', () => {
    if (game.prestige < 3) return;
    game.autoPrestigeEnabled = !game.autoPrestigeEnabled;
    updateAutoPrestigeInterval();
    updateUI();
});

function updateAutoPrestigeInterval() {
    if (autoPrestigeInterval) clearInterval(autoPrestigeInterval);
    if (game.autoPrestigeEnabled) {
        autoPrestigeInterval = setInterval(() => {
            const goal = getPrestigeGoal();
            if (game.totalEarnedThisPrestige >= goal) {
                game.prestige++;
                game.prestigeCurrency++;
                updatePrestigeBonuses();
                resetPrestigeProgress();
                playSound('prestige');
                updateUI();
                showHint('АВТОПРЕСТИЖ!');
            }
        }, 1000);
    }
}

// Переключение вкладок
tabNormal.addEventListener('click', () => {
    tabNormal.classList.add('active');
    tabPrestige.classList.remove('active');
    tabGlobal.classList.remove('active');
    upgradesGrid.style.display = 'grid';
    prestigeGrid.style.display = 'none';
    globalGrid.style.display = 'none';
    renderUpgrades(upgradesGrid, upgrades);
});

tabPrestige.addEventListener('click', () => {
    if (game.prestige === 0) return;
    tabPrestige.classList.add('active');
    tabNormal.classList.remove('active');
    tabGlobal.classList.remove('active');
    upgradesGrid.style.display = 'none';
    prestigeGrid.style.display = 'grid';
    globalGrid.style.display = 'none';
    renderPermUpgrades(prestigeGrid);
});

tabGlobal.addEventListener('click', () => {
    if (game.globalPrestigeCurrency === 0) return;
    tabGlobal.classList.add('active');
    tabNormal.classList.remove('active');
    tabPrestige.classList.remove('active');
    upgradesGrid.style.display = 'none';
    prestigeGrid.style.display = 'none';
    globalGrid.style.display = 'grid';
    renderGlobalUpgrades(globalGrid);
});

// Замена лица
function trySetImage() {
    const faceDiv = document.getElementById('toxixFace');
    const img = new Image();
    img.onload = function() {
        faceDiv.innerHTML = '';
        faceDiv.appendChild(img);
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.style.borderRadius = '50%';
    };
    img.onerror = function() {};
    img.src = 'toxix-face.png';
}

function showHint(text) {
    clickHint.style.opacity = '1';
    clickHint.textContent = text;
    setTimeout(() => clickHint.style.opacity = '0', 400);
}

// Инициализация
(async function() {
    await loadGame();
    trySetImage();
    startTimeCounter();
    startComboDecay();
    updateAutoPrestigeInterval();
})();

clickBtn.addEventListener('touchstart', (e) => e.preventDefault());
