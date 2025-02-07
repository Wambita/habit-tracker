// Initialize app state
let state = {
  routines: {},
  wellness: {
    water: 0,
    meals: { breakfast: false, lunch: false, dinner: false },
    sleep: { bedtime: null, waketime: null }
  },
  streaks: {
    current: 0,
    longest: 0,
    lastCompleted: null
  },
  weeklyHistory: [],
  encouragements: [
    "You're crushing it! ",
    "Every small step counts! ",
    "Consistency is key! ",
    "Proud of your progress! ",
    "You're building great habits! "
  ]
}

let dailyResetTimer;
let notificationTimeout;

// Theme management
function initializeTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  
  const themeToggle = document.querySelector('.theme-toggle');
  if (!themeToggle) {
    setTimeout(initializeTheme, 500); // Retry after delay
    return;
  }
  
  themeToggle.innerHTML = savedTheme === 'dark' ? 
    '<svg viewBox="0 0 24 24"><use href="#sun"/></svg>' :
    '<svg viewBox="0 0 24 24"><use href="#moon"/></svg>';

  themeToggle.addEventListener('click', handleThemeToggle);
  themeToggle.addEventListener('touchstart', handleThemeToggle);
}

function handleThemeToggle(e) {
  e.preventDefault();
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  document.documentElement.setAttribute('data-theme', newTheme);
  const themeToggle = document.querySelector('.theme-toggle');
  
  themeToggle.innerHTML = newTheme === 'dark' ?
    '<svg viewBox="0 0 24 24"><use href="#sun"/></svg>' :
    '<svg viewBox="0 0 24 24"><use href="#moon"/></svg>';

  localStorage.setItem('theme', newTheme);
}

// LocalStorage management
function initializeStorage() {
  if (!localStorage.getItem('streakData')) {
    state.routines = {
      morning: [],
      school: [],
      night: [],
      weekend: []
    }
    localStorage.setItem('streakData', JSON.stringify(state))
  }
}

function saveState() {
  localStorage.setItem('streakData', JSON.stringify(state))
}

function loadState() {
  const saved = JSON.parse(localStorage.getItem('streakData'))
  if (saved) Object.assign(state, saved)
}

// Routine management functions
function addRoutine(name) {
  if (state.routines[name]) return
  state.routines[name] = []
  saveState()
  renderTabs()
}

function deleteRoutine(name) {
  delete state.routines[name]
  saveState()
  renderTabs()
  renderRoutineSections()
}

function addTaskToRoutine(routineName, taskText) {
  state.routines[routineName].push({ task: taskText, completed: false })
  saveState()
}

function deleteTask(routineName, index) {
  state.routines[routineName].splice(index, 1)
  saveState()
}

function updateTask(routineName, index, newText) {
  state.routines[routineName][index].task = newText
  saveState()
}

// UI Rendering
function renderTabs() {
  const tabsContainer = document.querySelector('.routine-tabs');
  if (!tabsContainer) return; // Add null check
  
  tabsContainer.querySelectorAll('.tab:not(.add-routine-btn)').forEach(tab => tab.remove());

  Object.keys(state.routines).forEach(routine => {
    const tab = document.createElement('button')
    tab.className = 'tab'
    tab.dataset.routine = routine // Store original name in dataset
    tab.innerHTML = `
      ${routine}
      <svg class="edit-icon" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
      <svg class="delete-icon" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
    `
    tabsContainer.insertBefore(tab, document.querySelector('.add-routine-btn'))
  })
}

function renderRoutineSections() {
  const main = document.querySelector('main');
  if (!main) return; // Add main element check
  
  Object.keys(state.routines).forEach(routine => {
    if (!document.getElementById(`${sanitizeId(routine)}-routine`)) {
      createRoutineSection(routine)
    }
    createTaskList(routine)
  })
}

function createRoutineSection(routine) {
  const sanitized = sanitizeId(routine);
  const section = document.createElement('section')
  section.className = 'routine-section'
  section.id = `${sanitized}-routine`
  section.dataset.routineName = routine; // Add dataset for original name
  
  section.innerHTML = `
    <h2>${routine}</h2>
    <ul class="task-list"></ul>
    <div class="add-task">
      <input type="text" placeholder="Add new task">
      <button class="add-task-btn">+</button>
    </div>
  `
  
  const main = document.querySelector('main')
  main.insertBefore(section, main.firstChild)
}

// Updated task list creation
function createTaskList(routine) {
  const sanitized = sanitizeId(routine);
  const ul = document.querySelector(`#${sanitized}-routine .task-list`)
  ul.innerHTML = ''
  
  state.routines[routine].forEach((taskObj, index) => {
    const li = document.createElement('li')
    li.className = 'task-item'
    li.innerHTML = `
      <input type="checkbox" ${taskObj.completed ? 'checked' : ''} data-index="${index}">
      <span class="task-text">${taskObj.task}</span>
      <button class="edit-task-btn">
        <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
      </button>
      <button class="delete-task-btn">
        <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
      </button>
    `
    ul.appendChild(li)
  })
}

// Event delegation for task management
document.addEventListener('click', (e) => {
  // Delete routine
  if (e.target.closest('.delete-icon')) {
    const tab = e.target.closest('.tab');
    if (tab?.dataset?.routine) {
      if (confirm(`Delete "${tab.dataset.routine}" routine?`)) {
        deleteRoutine(tab.dataset.routine);
      }
    }
  }
  
  // Edit routine name
  if (e.target.closest('.edit-icon')) {
    const tab = e.target.closest('.tab');
    if (tab?.dataset?.routine) {
      const newName = prompt('Enter new routine name:', tab.dataset.routine);
      if (newName) {
        const oldName = tab.dataset.routine;
        state.routines[newName] = state.routines[oldName];
        delete state.routines[oldName];
        saveState();
        renderTabs();
        renderRoutineSections();
      }
    }
  }
  
  // Add task - UPDATED
  if (e.target.closest('.add-task-btn')) {
    const section = e.target.closest('.routine-section');
    const input = section.querySelector('.add-task input');
    const routine = section.dataset.routineName;
    
    if (input.value.trim()) {
      addTaskToRoutine(routine, input.value.trim());
      input.value = '';
      createTaskList(routine);
    }
  }
  
  // Edit task
  if (e.target.closest('.edit-task-btn')) {
    const li = e.target.closest('.task-item')
    const index = li.querySelector('input').dataset.index
    const routine = li.closest('.routine-section').id.replace('-routine', '')
    const newText = prompt('Edit task:', state.routines[routine][index].task)
    if (newText) {
      updateTask(routine, index, newText)
      createTaskList(routine)
    }
  }
  
  // Delete task
  if (e.target.closest('.delete-task-btn')) {
    const li = e.target.closest('.task-item')
    const index = li.querySelector('input').dataset.index
    const routine = li.closest('.routine-section').id.replace('-routine', '')
    if (confirm('Delete this task?')) {
      deleteTask(routine, index)
      createTaskList(routine)
    }
  }
})

// Update task checkbox handling
document.addEventListener('change', (e) => {
  if (e.target.matches('input[type="checkbox"]')) {
    const section = e.target.closest('.routine-section');
    const routine = section.dataset.routineName; // Use dataset
    const index = e.target.dataset.index;
    
    state.routines[routine][index].completed = e.target.checked;
    updateStreaks();
    saveState();
    updateStreakDisplay();
  }
})

// Daily reset functionality
function scheduleDailyReset() {
  const now = new Date();
  const night = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1
  );
  const msToMidnight = night - now;

  if (dailyResetTimer) clearTimeout(dailyResetTimer);
  
  dailyResetTimer = setTimeout(() => {
    resetDailyWellness();
    checkWellnessStreak();
    scheduleDailyReset();
  }, msToMidnight);
}

function resetDailyWellness() {
  state.wellness = {
    water: 0,
    meals: { breakfast: false, lunch: false, dinner: false },
    sleep: { bedtime: null, waketime: null }
  };
  saveState();
  updateWellnessDisplays();
  generateWeeklyInsights();
}

// Updated wellness tracking with auto-save
function setupWellnessTracking() {
  // Add null checks for all wellness elements
  const waterBtns = document.querySelectorAll('.water-btn');
  if (waterBtns.length === 0) return;
  
  const mealChecks = document.querySelectorAll('.meal-check');
  const sleepInputs = document.querySelectorAll('.sleep-input');
  
  // Water tracking
  waterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (!btn) return;
      const delta = btn.textContent === '+' ? 1 : -1;
      state.wellness.water = Math.max(0, state.wellness.water + delta);
      const waterCount = document.querySelector('.water-count');
      if (waterCount) waterCount.textContent = state.wellness.water;
      saveState();
      checkWellnessStreak();
    });
  });

  // Meal tracking
  mealChecks.forEach(checkbox => {
    checkbox.addEventListener('change', e => {
      if (!e.target) return;
      const mealType = e.target.nextSibling.textContent.trim().toLowerCase();
      state.wellness.meals[mealType] = e.target.checked;
      saveState();
      checkWellnessStreak();
    });
  });

  // Sleep tracking
  sleepInputs.forEach(input => {
    input.addEventListener('change', e => {
      if (!e.target) return;
      const type = e.target.id;
      state.wellness.sleep[type] = e.target.value;
      saveState();
      checkWellnessStreak();
    });
  });
}

// Auto-streak functionality
function checkWellnessStreak() {
  const wellnessComplete = (
    state.wellness.water >= 8 &&
    Object.values(state.wellness.meals).every(Boolean) &&
    state.wellness.sleep.bedtime &&
    state.wellness.sleep.waketime
  );

  document.querySelectorAll('.wellness-card').forEach(card => {
    card.classList.toggle('wellness-complete', wellnessComplete);
  });

  if (wellnessComplete) {
    const today = new Date().toDateString();
    if (state.streaks.lastCompleted !== today) {
      state.streaks.current++;
      state.streaks.longest = Math.max(state.streaks.current, state.streaks.longest);
      state.streaks.lastCompleted = today;
      saveState();
      updateStreakDisplay();
    }
  }

  // Add to weekly history
  if (state.weeklyHistory.length >= 7) state.weeklyHistory.shift();
  state.weeklyHistory.push({
    date: new Date().toISOString(),
    wellnessComplete,
    water: state.wellness.water,
    meals: {...state.wellness.meals},
    sleep: {...state.wellness.sleep},
    taskCompletion: document.querySelector('.progress-fill')?.style.width || '0%'
  });
  
  generateWeeklyInsights();
}

// Analytics
function updateProgress() {
  const progressFill = document.querySelector('.progress-fill');
  if (!progressFill) return;
  
  const completed = document.querySelectorAll('input:checked').length;
  const total = document.querySelectorAll('input[type="checkbox"]').length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  progressFill.style.width = `${percent}%`;
  const weeklyStats = document.getElementById('weekly-stats');
  if (weeklyStats) weeklyStats.textContent = `Completion: ${percent}% | Water: ${state.wellness.water} glasses`;
}

function updateStreakDisplay() {
  const overallStreak = document.getElementById('overall-streak');
  if (overallStreak) overallStreak.textContent = `Current Streak: ${state.streaks.current} days`;
  const longestStreak = document.getElementById('longest-streak');
  if (longestStreak) longestStreak.textContent = `Record: ${state.streaks.longest} days`;
}

// Streaks
function updateStreaks() {
  const today = new Date().toDateString()
  const last = new Date(state.streaks.lastCompleted)
  
  if (!state.streaks.lastCompleted) return
  
  if (today === last.toDateString()) return
  
  const dayDiff = (date1, date2) => 
    Math.floor((date2 - date1) / (1000 * 60 * 60 * 24))
    
  const diff = dayDiff(last, new Date())
  
  if (diff === 1) {
    state.streaks.current++
    state.streaks.longest = Math.max(
      state.streaks.current,
      state.streaks.longest
    )
  } else {
    state.streaks.current = 0
  }
}

// Event listeners for checkboxes
document.addEventListener('change', (e) => {
  if (e.target.matches('input[type="checkbox"]')) {
    const section = e.target.closest('.routine-section');
    const routine = section.dataset.routineName; // Use dataset
    const index = e.target.dataset.index;
    
    state.routines[routine][index].completed = e.target.checked;
    updateStreaks();
    saveState();
    updateStreakDisplay();
  }
})

// Update wellness displays
function updateWellnessDisplays() {
  // TO DO: implement updateWellnessDisplays function
}

// Sanitization for routine names
function sanitizeId(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '-');
}

async function getAICompletion(prompt, context) {
  try {
    const response = await fetch('/api/ai_completion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        prompt: `Act as a wellness coach analyzing this user data. Provide brief, empathetic advice in 1-2 sentences. Follow these rules:
        - Use emojis relevant to context
        - Never mention "data" or "analysis"
        - Prioritize hydration and sleep
        - Reference streak status when relevant
        - Format: [Brief tip] [Supportive phrase] [Relevant emoji]
        
        interface AIResponse {
          message: string;
        }
        {"message": "Your 5-day streak is impressive! Remember to drink water between tasks. 💪"}
        `,
        data: {
          message: prompt,
          wellness: context.wellness,
          streaks: context.streaks
        }
      }),
    });
    return await response.json();
  } catch (error) {
    console.error('AI Error:', error);
    return {message: "Let's focus on building healthy habits! 💪"};
  }
}

// Replace existing generateResponse function
async function generateResponse(input) {
  try {
    const aiResponse = await getAICompletion(input, {
      wellness: state.wellness,
      streaks: state.streaks,
      lastCompleted: state.streaks.lastCompleted
    });
    return aiResponse.message;
  } catch (error) {
    // Fallback to rule-based responses
    const progress = document.querySelector('.progress-fill')?.style.width || '0%';
    return `${state.encouragements[Math.floor(Math.random() * state.encouragements.length)]} Current task completion: ${progress} 😊`;
  }
}

// Add weekly AI insights
async function generateWeeklyInsights() {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  if (!state.weeklyHistory) return;
  
  const weekData = state.weeklyHistory.filter(day => 
    new Date(day.date) <= now && new Date(day.date) >= oneWeekAgo
  );

  if (weekData.length === 0) return;

  const validData = weekData.filter(day => day.taskCompletion !== '0%');
  const totalCompletion = validData.reduce((sum, day) => {
    return sum + parseInt(day.taskCompletion);
  }, 0);
  const avgCompletion = validData.length > 0 ? 
    Math.round(totalCompletion / validData.length) : 0;

  const waterDays = weekData.filter(day => day.water >= 8).length;
  
  const mealDays = weekData.filter(day => 
    Object.values(day.meals).every(Boolean)
  ).length;
  
  const sleepDays = weekData.filter(day => 
    day.sleep.bedtime && day.sleep.waketime
  ).length;

  const completionCircle = document.querySelector('#completion-rate-circle');
  if (completionCircle) {
    const circumference = 2 * Math.PI * 45;
    const dashValue = (avgCompletion / 100) * circumference;
    completionCircle.style.strokeDasharray = `${dashValue} ${circumference}`;
  }

  document.getElementById('completion-rate').textContent = `${avgCompletion}%`;
  document.getElementById('water-consistency').textContent = `${waterDays}/${weekData.length}`;
  document.getElementById('meal-consistency').textContent = `${mealDays}/${weekData.length}`;
  document.getElementById('sleep-consistency').textContent = `${sleepDays}/${weekData.length}`;
  
  checkStreakNotifications();
  updateStreakDisplay();
}

// New streak notification system
function checkStreakNotifications() {
  const now = new Date();
  const lastCompleted = state.streaks.lastCompleted ? 
    new Date(state.streaks.lastCompleted) : null;
  
  if (state.streaks.current === 0) return;

  if (lastCompleted) {
    const hoursSince = (now - lastCompleted) / (1000 * 60 * 60);
    
    if (hoursSince > 20) {
      showNotification("Don't forget to keep your streak going!");
    }
    if (hoursSince > 36) {
      showNotification("⚠️ Your streak is in danger! Complete tasks to maintain it!");
    }
  }

  const eveningCutoff = 19; 
  if (now.getHours() >= eveningCutoff) {
    if (state.wellness.water < 6) {
      showNotification("💧 You're behind on water! Drink some before bed!");
    }
    if (!state.wellness.meals.dinner) {
      showNotification("🍽 Don't forget to have dinner!");
    }
    if (!state.wellness.sleep.bedtime) {
      showNotification("🛌 Set your bedtime to maintain sleep consistency!");
    }
  }
}

// Notification system
function showNotification(message) {
  const existing = document.querySelector('.notification-badge');
  if (existing) existing.remove();

  const notification = document.createElement('div');
  notification.className = 'notification-badge';
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => notification.classList.add('visible'), 10);
  
  if (notificationTimeout) clearTimeout(notificationTimeout);
  notificationTimeout = setTimeout(() => {
    notification.classList.remove('visible');
    setTimeout(() => notification.remove(), 300);
  }, 5000);
}

// Update wellness sync
function syncWellnessUI() {
  const waterCount = document.querySelector('.water-count');
  if (waterCount) waterCount.textContent = state.wellness.water;
  
  document.querySelectorAll('.meal-check').forEach((checkbox, index) => {
    checkbox.checked = Object.values(state.wellness.meals)[index];
  });

  const bedtime = document.getElementById('bedtime');
  if (bedtime) bedtime.value = state.wellness.sleep.bedtime || '';
  
  const waketime = document.getElementById('waketime');
  if (waketime) waketime.value = state.wellness.sleep.waketime || '';
}

function initializeChatbot() {
  const toggle = document.querySelector('.chatbot-toggle');
  const window = document.querySelector('.chatbot-window');
  
  if (!toggle || !window) {
    setTimeout(initializeChatbot, 1000); // Retry after 1 second
    return;
  }
  
  toggle.addEventListener('touchstart', (e) => {
    e.preventDefault();
    window.classList.toggle('active');
  });

  async function handleMessage() {
    const msg = input.value.trim();
    if (!msg) return;

    addMessage(msg, 'user');
    input.value = '';
    
    const typing = document.querySelector('.ai-typing-indicator');
    typing?.classList.add('visible');

    try {
      const response = await generateResponse(msg);
      addMessage(response, 'bot');
    } catch (error) {
      const fallback = getFallbackResponse();
      addMessage(fallback, 'bot');
    }
    
    typing?.classList.remove('visible');
  }

  function getFallbackResponse() {
    const progress = document.querySelector('.progress-fill')?.style.width || '0%';
    const randomIndex = Math.floor(Math.random() * state.encouragements.length);
    return `${state.encouragements[randomIndex]} Current completion: ${progress} 😊`;
  }

  function addMessage(text, type) {
    const div = document.createElement('div');
    div.className = `msg ${type}-msg`;
    div.textContent = text;
    document.querySelector('.chat-messages').appendChild(div);
    window.scrollTo(0, window.scrollHeight);
  }

  function generateResponse(input) {
    return getAICompletion(input, {
      wellness: state.wellness,
      streaks: state.streaks,
      lastCompleted: state.streaks.lastCompleted
    });
  }

  function showInitialTips() {
    const initialTips = [
      "Hi! I'm your wellness assistant. Ask me for tips!",
      `Current streak: ${state.streaks.current} days 💪`,
      `Water intake today: ${state.wellness.water}/8 glasses 💧`
    ];
    
    initialTips.forEach(tip => addMessage(tip, 'bot'));
  }

  toggle.addEventListener('click', () => {
    window.classList.toggle('active');
    if (window.classList.contains('active') && document.querySelectorAll('.chat-messages .msg').length === 0) {
      showInitialTips();
    }
  });

  const closeBtn = document.querySelector('.close-chat');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => window.classList.remove('active'));
  }

  const sendBtn = document.querySelector('.send-msg');
  if (sendBtn) {
    sendBtn.addEventListener('click', handleMessage);
  }

  const input = document.querySelector('#chat-input');
  if (input) {
    input.addEventListener('keypress', e => e.key === 'Enter' && handleMessage());
  }
}

// Add mobile viewport height fix
function fixMobileViewport() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// Update initializeApp
function initializeApp() {
  fixMobileViewport();
  window.addEventListener('resize', fixMobileViewport);
  initializeTheme();
  initializeStorage();
  loadState();
  renderTabs();
  renderRoutineSections();
  setupWellnessTracking();
  scheduleDailyReset();
  
  if (document.querySelector('.progress-fill')) {
    setInterval(updateProgress, 1000);
  }
  
  updateStreakDisplay();
  checkWellnessStreak();

  // Add null checks for modal elements
  const addRoutineBtn = document.querySelector('.add-routine-btn');
  const cancelBtn = document.getElementById('cancel-routine');
  const saveBtn = document.getElementById('save-routine');

  if (addRoutineBtn) {
    addRoutineBtn.addEventListener('click', () => {
      const modal = document.getElementById('routine-modal');
      if (modal) modal.style.display = 'block';
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      const modal = document.getElementById('routine-modal');
      if (modal) modal.style.display = 'none';
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const nameInput = document.getElementById('routine-name');
      if (nameInput) {
        const name = nameInput.value.trim();
        if (name) {
          addRoutine(name);
          const modal = document.getElementById('routine-modal');
          if (modal) modal.style.display = 'none';
        }
      }
    });
  }

  // Add safe interval check
  if (document.getElementById('encouragement-message')) {
    setInterval(updateEncouragement, 60000 * 60);
    updateEncouragement();
  }
  
  syncWellnessUI();
  checkStreakNotifications();
  initializeChatbot();
}

function updateEncouragement() {
  const encouragementEl = document.getElementById('encouragement-message');
  if (!encouragementEl) return;
  
  const randomIndex = Math.floor(Math.random() * state.encouragements.length);
  encouragementEl.textContent = state.encouragements[randomIndex];
}

// Init
document.addEventListener('DOMContentLoaded', function() {
  if (!document.querySelector('main') || !document.querySelector('header')) {
    setTimeout(arguments.callee, 500); // Retry if DOM not ready
    return;
  }
  initializeApp();
})