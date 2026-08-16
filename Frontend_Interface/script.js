// ---- State ----
let tasks = [];
let currentFilter = 'all';

// ---- DOM References ----
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskListEl = document.querySelector('.task-list');
const taskCountEl = document.getElementById('task-count');
const filterBtns = document.querySelectorAll('.filter-btn');
const themeToggle = document.getElementById('theme-toggle');
const progressRing = document.getElementById('progress-ring');
const progressPercent = document.getElementById('progress-percent');
const confettiContainer = document.getElementById('confetti-container');
const activeCountEl = document.getElementById('active-count');
const completedCountEl = document.getElementById('completed-count');

// ---- Theme Toggle ----
themeToggle.addEventListener('click', function () {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
  themeToggle.textContent = isDark ? '🌙' : '☀️';
});

// ---- Add Task ----
taskForm.addEventListener('submit', function (e) {
  e.preventDefault();
  const text = taskInput.value.trim();
  if (text === '') return;

  tasks.push({ id: Date.now(), text: text, completed: false });
  taskInput.value = '';
  render();
});

// ---- Toggle Complete / Delete ----
taskListEl.addEventListener('click', function (e) {
  const taskItem = e.target.closest('.task-item');
  if (!taskItem) return;

  const taskId = Number(taskItem.dataset.id);
  const clickedCheck = e.target.closest('.check-btn');
  const clickedDelete = e.target.closest('.delete-btn');

  if (clickedDelete) {
    tasks = tasks.filter(t => t.id !== taskId);
  } else if (clickedCheck || e.target.classList.contains('task-text')) {
    tasks = tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
  }

  render();
});

// ---- Filter Buttons ----
filterBtns.forEach(btn => {
  btn.addEventListener('click', function () {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    render();
  });
});

// ---- Confetti ----
function launchConfetti() {
  const colors = ['#6B4E8E', '#C9B8E8', '#E8B84B', '#7FB88C', '#D96A6A'];
  for (let i = 0; i < 60; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + 'vw';
    piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDuration = (Math.random() * 2 + 2) + 's';
    piece.style.animationDelay = (Math.random() * 0.5) + 's';
    confettiContainer.appendChild(piece);
    setTimeout(() => piece.remove(), 4000);
  }
}

// ---- Render ----
function render() {
  let filteredTasks = tasks;
  if (currentFilter === 'active') filteredTasks = tasks.filter(t => !t.completed);
  if (currentFilter === 'completed') filteredTasks = tasks.filter(t => t.completed);

  taskListEl.innerHTML = '';

  if (filteredTasks.length === 0) {
    taskListEl.innerHTML = '<p class="empty-msg">No tasks here.</p>';
  } else {
    filteredTasks.forEach(task => {
      const taskEl = document.createElement('div');
      taskEl.className = 'task-item' + (task.completed ? ' completed' : '');
      taskEl.dataset.id = task.id;
      taskEl.innerHTML = `
        <button class="check-btn ${task.completed ? 'checked' : ''}" aria-label="Toggle complete">
          ${task.completed ? '<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>' : ''}
        </button>
        <span class="task-text">${task.text}</span>
        <button class="delete-btn" aria-label="Delete task">
          <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      `;
      taskListEl.appendChild(taskEl);
    });
  }

  // Counts
  const activeCount = tasks.filter(t => !t.completed).length;
  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;

  taskCountEl.textContent = `${activeCount} task${activeCount !== 1 ? 's' : ''} left`;
  activeCountEl.textContent = activeCount;
  completedCountEl.textContent = completedCount;

  // Progress ring
  const percent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
  progressRing.style.background = `conic-gradient(var(--color-mocha) ${percent}%, var(--color-grey) ${percent}%)`;
  progressPercent.textContent = `${percent}%`;

  // Celebrate at 100%
  if (totalCount > 0 && percent === 100 && !window.__celebrated) {
    launchConfetti();
    window.__celebrated = true;
  } else if (percent < 100) {
    window.__celebrated = false;
  }
}

render();