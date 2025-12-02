// =================== INITIALIZATION ===================
document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
    
    // Initialize date and time
    updateDateTime();
    setInterval(updateDateTime, 60000); // Update every minute
    
    // Initialize dashboard stats
    updateDashboardStats();
    
    // Initialize timetable
    initializeTimetable();
    
    // Load saved data
    loadTasks();
    loadNotes();
    loadDeadlines();
    loadClasses();
    
    // Set up event listeners
    setupEventListeners();
    
    // Show motivation quote
    showRandomMotivation();
    
    // Check for upcoming deadlines
    checkDeadlineNotifications();
    
    // Update badge counts
    updateBadgeCounts();
});

// =================== THEME MANAGEMENT ===================
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    let newTheme = currentTheme === 'light' ? 'dark' : 'light';
    changeTheme(newTheme);
}

function changeTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    updateThemeIcon(theme);
    showToast('Theme changed to ' + theme + ' mode');
}

function updateThemeIcon(theme) {
    const icon = document.getElementById('themeIcon');
    if (theme === 'dark') {
        icon.className = 'fas fa-sun';
    } else {
        icon.className = 'fas fa-moon';
    }
}

// =================== DATE & TIME ===================
function updateDateTime() {
    const now = new Date();
    const dateTimeElement = document.getElementById('currentDateTime');
    
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    dateTimeElement.textContent = now.toLocaleDateString('en-US', options);
}

// =================== LOGIN/REGISTER ===================
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('errorMsg');
    
    // Simple demo authentication
    if (username === 'student' && password === '1234') {
        document.getElementById('loginPage').style.display = 'none';
        document.getElementById('app').style.display = 'block';
        document.getElementById('loggedInUser').textContent = username;
        showToast('Welcome back, ' + username + '!');
    } else {
        errorMsg.textContent = 'Invalid credentials. Use: student / 1234';
    }
}

function showRegister() {
    document.querySelector('.login-card').style.display = 'none';
    document.querySelector('.register-card').style.display = 'block';
}

function showLogin() {
    document.querySelector('.register-card').style.display = 'none';
    document.querySelector('.login-card').style.display = 'block';
}

function register() {
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    const errorMsg = document.getElementById('regErrorMsg');
    
    // Simple validation
    if (!username || !email || !password) {
        errorMsg.textContent = 'All fields are required';
        return;
    }
    
    if (password !== confirmPassword) {
        errorMsg.textContent = 'Passwords do not match';
        return;
    }
    
    if (password.length < 6) {
        errorMsg.textContent = 'Password must be at least 6 characters';
        return;
    }
    
    // In a real app, you would send this to a server
    // For demo purposes, we'll just show a success message
    errorMsg.textContent = '';
    errorMsg.style.color = 'green';
    errorMsg.textContent = 'Registration successful!';
    
    // Switch back to login after 2 seconds
    setTimeout(() => {
        showLogin();
        errorMsg.style.color = 'red';
        errorMsg.textContent = '';
    }, 2000);
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        document.getElementById('app').style.display = 'none';
        document.getElementById('loginPage').style.display = 'flex';
        showToast('Logged out successfully');
    }
}

// =================== NAVIGATION ===================
function showPage(pageId, element) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    document.getElementById(pageId).classList.add('active');
    
    // Update active nav link
    if (element) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        element.classList.add('active');
    }
}

// =================== TASK MANAGER ===================
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

function addTask() {
    const taskInput = document.getElementById('taskInput');
    const priority = document.getElementById('taskPriority').value;
    const dueDate = document.getElementById('taskDueDate').value;
    
    if (!taskInput.value.trim()) {
        showToast('Please enter a task description');
        return;
    }
    
    const task = {
        id: Date.now(),
        title: taskInput.value,
        priority: priority,
        dueDate: dueDate || null,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    tasks.push(task);
    saveTasks();
    renderTasks();
    taskInput.value = '';
    showToast('Task added successfully');
    updateDashboardStats();
    updateBadgeCounts();
}

function renderTasks(filter = 'all') {
    const taskList = document.getElementById('taskList');
    const filteredTasks = filterTasksByType(filter);
    
    if (filteredTasks.length === 0) {
        taskList.innerHTML = '<p class="no-data">No tasks found. Add your first task!</p>';
        return;
    }
    
    taskList.innerHTML = '';
    filteredTasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = `task-item ${task.priority} ${task.completed ? 'completed' : ''}`;
        
        const dueDateText = task.dueDate ? 
            `Due: ${new Date(task.dueDate).toLocaleDateString()}` : 
            'No due date';
        
        taskElement.innerHTML = `
            <div class="task-content">
                <div class="task-title">${task.title}</div>
                <div class="task-meta">
                    <span>${task.priority.toUpperCase()} priority</span>
                    <span>${dueDateText}</span>
                </div>
            </div>
            <div class="task-actions">
                ${!task.completed ? `
                    <button class="task-btn complete-btn" onclick="toggleTaskComplete(${task.id})">
                        <i class="fas fa-check"></i> Complete
                    </button>
                ` : ''}
                <button class="task-btn delete-btn" onclick="deleteTask(${task.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        
        taskList.appendChild(taskElement);
    });
}

function filterTasks(filter) {
    // Update filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    renderTasks(filter);
}

function filterTasksByType(filter) {
    switch(filter) {
        case 'pending':
            return tasks.filter(task => !task.completed);
        case 'completed':
            return tasks.filter(task => task.completed);
        case 'high':
            return tasks.filter(task => task.priority === 'high');
        default:
            return tasks;
    }
}

function toggleTaskComplete(taskId) {
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
        tasks[taskIndex].completed = !tasks[taskIndex].completed;
        saveTasks();
        renderTasks();
        updateDashboardStats();
        updateBadgeCounts();
        showToast(`Task marked as ${tasks[taskIndex].completed ? 'completed' : 'pending'}`);
    }
}

function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(task => task.id !== taskId);
        saveTasks();
        renderTasks();
        updateDashboardStats();
        updateBadgeCounts();
        showToast('Task deleted');
    }
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks() {
    tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    renderTasks();
}

// =================== TIMETABLE ===================
let classes = JSON.parse(localStorage.getItem('classes')) || [];
let currentWeek = 1;

function initializeTimetable() {
    generateTimetableGrid();
    renderClasses();
}

function generateTimetableGrid() {
    const timetableBody = document.getElementById('timetableBody');
    timetableBody.innerHTML = '';
    
    // Generate time slots from 8 AM to 8 PM
    for (let hour = 8; hour <= 20; hour++) {
        const row = document.createElement('tr');
        
        // Time cell
        const timeCell = document.createElement('td');
        const timeText = hour <= 12 ? `${hour}:00 AM` : `${hour-12}:00 PM`;
        timeCell.textContent = timeText;
        timeCell.style.fontWeight = '600';
        row.appendChild(timeCell);
        
        // Day cells
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        days.forEach(day => {
            const dayCell = document.createElement('td');
            dayCell.id = `${day}-${hour}`;
            row.appendChild(dayCell);
        });
        
        timetableBody.appendChild(row);
    }
}

function showAddClassModal() {
    document.getElementById('addClassModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('addClassModal').style.display = 'none';
}

function saveClass() {
    const className = document.getElementById('className').value;
    const instructor = document.getElementById('classInstructor').value;
    const day = document.getElementById('classDay').value;
    const startTime = document.getElementById('classStartTime').value;
    const endTime = document.getElementById('classEndTime').value;
    const type = document.getElementById('classType').value;
    const location = document.getElementById('classLocation').value;
    
    if (!className || !startTime || !endTime) {
        showToast('Please fill in all required fields');
        return;
    }
    
    const classObj = {
        id: Date.now(),
        name: className,
        instructor: instructor,
        day: day,
        startTime: startTime,
        endTime: endTime,
        type: type,
        location: location,
        week: currentWeek
    };
    
    classes.push(classObj);
    saveClasses();
    renderClasses();
    closeModal();
    showToast('Class added to timetable');
    updateDashboardStats();
    
    // Clear form
    document.getElementById('className').value = '';
    document.getElementById('classInstructor').value = '';
    document.getElementById('classStartTime').value = '';
    document.getElementById('classEndTime').value = '';
    document.getElementById('classLocation').value = '';
}

function renderClasses() {
    // Clear all cells
    document.querySelectorAll('td[id^="monday-"], td[id^="tuesday-"], td[id^="wednesday-"], td[id^="thursday-"], td[id^="friday-"], td[id^="saturday-"]').forEach(cell => {
        cell.innerHTML = '';
    });
    
    // Filter classes for current week
    const weekClasses = classes.filter(cls => cls.week === currentWeek);
    
    weekClasses.forEach(cls => {
        const startHour = parseInt(cls.startTime.split(':')[0]);
        const cellId = `${cls.day}-${startHour}`;
        const cell = document.getElementById(cellId);
        
        if (cell) {
            const classElement = document.createElement('div');
            classElement.className = `timetable-cell ${cls.type}`;
            classElement.innerHTML = `
                <div class="class-time">${cls.startTime} - ${cls.endTime}</div>
                <div class="class-name">${cls.name}</div>
                <div class="class-meta">${cls.instructor} • ${cls.location}</div>
            `;
            
            // Add delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-class';
            deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
            deleteBtn.style.position = 'absolute';
            deleteBtn.style.top = '5px';
            deleteBtn.style.right = '5px';
            deleteBtn.style.background = 'transparent';
            deleteBtn.style.border = 'none';
            deleteBtn.style.color = 'var(--danger-color)';
            deleteBtn.style.cursor = 'pointer';
            deleteBtn.onclick = (e) => {
                e.stopPropagation();
                deleteClass(cls.id);
            };
            
            classElement.appendChild(deleteBtn);
            cell.appendChild(classElement);
        }
    });
}

function deleteClass(classId) {
    if (confirm('Are you sure you want to remove this class?')) {
        classes = classes.filter(cls => cls.id !== classId);
        saveClasses();
        renderClasses();
        showToast('Class removed from timetable');
        updateDashboardStats();
    }
}

function changeWeek(direction) {
    currentWeek += direction;
    if (currentWeek < 1) currentWeek = 1;
    if (currentWeek > 4) currentWeek = 4;
    
    document.getElementById('currentWeek').textContent = `Week ${currentWeek}`;
    renderClasses();
}

function saveClasses() {
    localStorage.setItem('classes', JSON.stringify(classes));
}

function loadClasses() {
    classes = JSON.parse(localStorage.getItem('classes')) || [];
}

// =================== NOTES ===================
let notes = JSON.parse(localStorage.getItem('notes')) || [];

function saveNote() {
    const title = document.getElementById('noteTitle').value;
    const content = document.getElementById('noteContent').value;
    const category = document.getElementById('noteCategory').value;
    
    if (!title || !content) {
        showToast('Please enter both title and content');
        return;
    }
    
    const note = {
        id: Date.now(),
        title: title,
        content: content,
        category: category,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    notes.push(note);
    saveNotes();
    renderNotes();
    
    // Clear form
    document.getElementById('noteTitle').value = '';
    document.getElementById('noteContent').value = '';
    
    showToast('Note saved successfully');
    updateDashboardStats();
}

function renderNotes(filter = 'all') {
    const notesGrid = document.getElementById('notesGrid');
    const filteredNotes = filter === 'all' ? notes : notes.filter(note => note.category === filter);
    
    if (filteredNotes.length === 0) {
        notesGrid.innerHTML = '<p class="no-data">No notes found. Create your first note!</p>';
        return;
    }
    
    notesGrid.innerHTML = '';
    filteredNotes.forEach(note => {
        const noteElement = document.createElement('div');
        noteElement.className = 'note-card';
        
        const date = new Date(note.createdAt).toLocaleDateString();
        const categoryColors = {
            'general': 'var(--primary-color)',
            'lecture': 'var(--info-color)',
            'assignment': 'var(--warning-color)',
            'project': 'var(--danger-color)',
            'personal': 'var(--success-color)'
        };
        
        noteElement.innerHTML = `
            <div class="note-header">
                <div>
                    <div class="note-title">${note.title}</div>
                </div>
                <span class="note-category" style="background: ${categoryColors[note.category] || categoryColors.general}; color: white;">
                    ${note.category.toUpperCase()}
                </span>
            </div>
            <div class="note-content">${note.content}</div>
            <div class="note-footer">
                <div class="note-date">Created: ${date}</div>
                <div class="note-actions">
                    <button onclick="editNote(${note.id})" style="background: var(--primary-color); color: white; border: none; padding: 5px 10px; border-radius: 5px; margin-right: 5px;">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button onclick="deleteNote(${note.id})" style="background: var(--danger-color); color: white; border: none; padding: 5px 10px; border-radius: 5px;">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
        
        notesGrid.appendChild(noteElement);
    });
}

function filterNotes(category) {
    // Update filter buttons
    document.querySelectorAll('.notes-filters .filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    renderNotes(category);
}

function editNote(noteId) {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;
    
    document.getElementById('noteTitle').value = note.title;
    document.getElementById('noteContent').value = note.content;
    document.getElementById('noteCategory').value = note.category;
    
    // Remove the note from the list
    deleteNote(noteId, false);
    
    showToast('Note loaded for editing');
    showPage('notes');
}

function deleteNote(noteId, confirmDelete = true) {
    if (confirmDelete && !confirm('Are you sure you want to delete this note?')) {
        return;
    }
    
    notes = notes.filter(note => note.id !== noteId);
    saveNotes();
    renderNotes();
    updateDashboardStats();
    showToast('Note deleted');
}

function saveNotes() {
    localStorage.setItem('notes', JSON.stringify(notes));
}

function loadNotes() {
    notes = JSON.parse(localStorage.getItem('notes')) || [];
    renderNotes();
}

// =================== DEADLINES ===================
let deadlines = JSON.parse(localStorage.getItem('deadlines')) || [];

function addDeadline() {
    const title = document.getElementById('deadlineTitle').value;
    const date = document.getElementById('deadlineDate').value;
    const time = document.getElementById('deadlineTime').value;
    const priority = document.getElementById('deadlinePriority').value;
    
    if (!title || !date) {
        showToast('Please enter title and date');
        return;
    }
    
    const deadline = {
        id: Date.now(),
        title: title,
        date: date,
        time: time,
        priority: priority,
        createdAt: new Date().toISOString(),
        notified: false
    };
    
    deadlines.push(deadline);
    saveDeadlines();
    renderDeadlines();
    updateDeadlineStats();
    
    // Clear form
    document.getElementById('deadlineTitle').value = '';
    document.getElementById('deadlineDate').value = '';
    
    showToast('Deadline reminder set');
    updateDashboardStats();
    updateBadgeCounts();
}

function renderDeadlines() {
    const deadlineList = document.getElementById('deadlineList');
    const now = new Date();
    
    // Sort deadlines by date
    deadlines.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    if (deadlines.length === 0) {
        deadlineList.innerHTML = '<p class="no-data">No deadlines set. Add your first deadline!</p>';
        return;
    }
    
    deadlineList.innerHTML = '';
    deadlines.forEach(deadline => {
        const deadlineDate = new Date(deadline.date);
        const timeDiff = deadlineDate - now;
        const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        
        let status = 'upcoming';
        if (daysLeft < 0) status = 'overdue';
        else if (daysLeft === 0) status = 'today';
        else if (daysLeft <= 2) status = 'urgent';
        
        const deadlineElement = document.createElement('div');
        deadlineElement.className = `deadline-item ${status}`;
        
        deadlineElement.innerHTML = `
            <div class="deadline-info">
                <div class="deadline-title">${deadline.title}</div>
                <div class="deadline-date">
                    <span>${deadlineDate.toLocaleDateString()} at ${deadline.time}</span>
                    <span>${deadline.priority.toUpperCase()} priority</span>
                </div>
            </div>
            <div class="deadline-actions">
                <div class="days-left">${daysLeft < 0 ? Math.abs(daysLeft) + ' days overdue' : daysLeft + ' days left'}</div>
                <button class="delete-btn" onclick="deleteDeadline(${deadline.id})" style="padding: 8px 15px; margin-left: 10px;">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        deadlineList.appendChild(deadlineElement);
    });
}

function deleteDeadline(deadlineId) {
    if (confirm('Are you sure you want to delete this deadline?')) {
        deadlines = deadlines.filter(d => d.id !== deadlineId);
        saveDeadlines();
        renderDeadlines();
        updateDeadlineStats();
        updateDashboardStats();
        updateBadgeCounts();
        showToast('Deadline removed');
    }
}

function updateDeadlineStats() {
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const upcoming = deadlines.filter(d => {
        const deadlineDate = new Date(d.date);
        return deadlineDate >= today;
    }).length;
    
    const todayCount = deadlines.filter(d => {
        const deadlineDate = new Date(d.date);
        deadlineDate.setHours(0, 0, 0, 0);
        return deadlineDate.getTime() === today.getTime();
    }).length;
    
    const overdue = deadlines.filter(d => {
        const deadlineDate = new Date(d.date);
        return deadlineDate < today;
    }).length;
    
    document.getElementById('upcomingCount').textContent = upcoming;
    document.getElementById('todayCount').textContent = todayCount;
    document.getElementById('overdueCount').textContent = overdue;
}

function checkDeadlineNotifications() {
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    deadlines.forEach(deadline => {
        const deadlineDate = new Date(deadline.date);
        const timeDiff = deadlineDate - now;
        const hoursLeft = Math.ceil(timeDiff / (1000 * 60 * 60));
        
        if (hoursLeft <= 24 && hoursLeft > 0 && !deadline.notified) {
            showToast(`Reminder: "${deadline.title}" is due in ${hoursLeft} hours!`);
            deadline.notified = true;
        }
    });
    
    saveDeadlines();
}

function saveDeadlines() {
    localStorage.setItem('deadlines', JSON.stringify(deadlines));
}

function loadDeadlines() {
    deadlines = JSON.parse(localStorage.getItem('deadlines')) || [];
    renderDeadlines();
    updateDeadlineStats();
}

// =================== DASHBOARD ===================
function updateDashboardStats() {
    // Task stats
    const pendingTasks = tasks.filter(task => !task.completed).length;
    const completedTasks = tasks.filter(task => task.completed).length;
    
    document.getElementById('pendingTasks').textContent = pendingTasks;
    document.getElementById('completedTasks').textContent = completedTasks;
    
    // Deadline stats
    const now = new Date();
    const upcomingDeadlines = deadlines.filter(d => new Date(d.date) >= now).length;
    document.getElementById('upcomingDeadlines').textContent = upcomingDeadlines;
    
    // Notes stats
    document.getElementById('savedNotes').textContent = notes.length;
    
    // Update today's schedule
    updateTodaySchedule();
    
    // Update urgent tasks
    updateUrgentTasks();
}

function updateTodaySchedule() {
    const todaySchedule = document.getElementById('todaySchedule');
    const now = new Date();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayName = dayNames[now.getDay()];
    
    const todayClasses = classes.filter(cls => 
        cls.day === todayName && 
        cls.week === currentWeek
    );
    
    if (todayClasses.length === 0) {
        todaySchedule.innerHTML = '<p class="no-data">No classes scheduled for today</p>';
        return;
    }
    
    todaySchedule.innerHTML = '';
    todayClasses.forEach(cls => {
        const classElement = document.createElement('div');
        classElement.className = 'schedule-item';
        classElement.innerHTML = `
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <strong>${cls.name}</strong>
                <span>${cls.startTime} - ${cls.endTime}</span>
            </div>
            <div style="color: var(--text-light); font-size: 0.9rem;">
                ${cls.instructor} • ${cls.location}
            </div>
        `;
        todaySchedule.appendChild(classElement);
    });
}

function updateUrgentTasks() {
    const urgentTasksDiv = document.getElementById('urgentTasks');
    const now = new Date();
    const urgent = tasks.filter(task => 
        !task.completed && 
        task.priority === 'high' && 
        task.dueDate && 
        new Date(task.dueDate) - now < 3 * 24 * 60 * 60 * 1000 // Within 3 days
    );
    
    if (urgent.length === 0) {
        urgentTasksDiv.innerHTML = '<p class="no-data">No urgent tasks at the moment</p>';
        return;
    }
    
    urgentTasksDiv.innerHTML = '';
    urgent.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = 'urgent-task-item';
        const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date';
        taskElement.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>${task.title}</span>
                <span style="color: var(--danger-color); font-weight: 600;">${dueDate}</span>
            </div>
        `;
        urgentTasksDiv.appendChild(taskElement);
    });
}


// SETTINGS
function updateProfile() {
    const username = document.getElementById('settingsUsername').value;
    const email = document.getElementById('settingsEmail').value;
    const password = document.getElementById('settingsPassword').value;
    
    if (!username) {
        showToast('Username cannot be empty');
        return;
    }
    
    // Update displayed username
    document.getElementById('loggedInUser').textContent = username;
    
    // In a real app, you would update this on the server
    showToast('Profile updated successfully');
}

function exportData() {
    const data = {
        tasks: tasks,
        notes: notes,
        deadlines: deadlines,
        classes: classes,
        settings: {
            theme: localStorage.getItem('theme'),
            username: document.getElementById('loggedInUser').textContent
        }
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'studysync-backup.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showToast('Data exported successfully');
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = function(event) {
            try {
                const data = JSON.parse(event.target.result);
                
                if (data.tasks) tasks = data.tasks;
                if (data.notes) notes = data.notes;
                if (data.deadlines) deadlines = data.deadlines;
                if (data.classes) classes = data.classes;
                
                if (data.settings) {
                    if (data.settings.theme) {
                        changeTheme(data.settings.theme);
                    }
                    if (data.settings.username) {
                        document.getElementById('loggedInUser').textContent = data.settings.username;
                    }
                }
                
                saveTasks();
                saveNotes();
                saveDeadlines();
                saveClasses();
                
                renderTasks();
                renderNotes();
                renderDeadlines();
                renderClasses();
                updateDashboardStats();
                updateBadgeCounts();
                
                showToast('Data imported successfully');
            } catch (error) {
                showToast('Error importing data: Invalid file format');
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

function clearAllData() {
    if (confirm('Are you absolutely sure? This will delete ALL your data and cannot be undone!')) {
        if (confirm('This is your last warning. All tasks, notes, deadlines, and classes will be permanently deleted.')) {
            localStorage.clear();
            
            // (Reset arrays)
            tasks = [];
            notes = [];
            deadlines = [];
            classes = [];
            
            // (Re-initialize with defaults)
            localStorage.setItem('theme', 'light');
            document.documentElement.setAttribute('data-theme', 'light');
            
            // (Re-render everything)
            renderTasks();
            renderNotes();
            renderDeadlines();
            renderClasses();
            updateDashboardStats();
            updateBadgeCounts();
            
            showToast('All data cleared successfully');
        }
    }
}

// ( UTILITY FUNCTIONS )
function showToast(message) {
    const toast = document.getElementById('notificationToast');
    const toastMessage = document.getElementById('toastMessage');
    
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    // (Auto-hide after 5 seconds)
    setTimeout(() => {
        toast.classList.remove('show');
    }, 5000);
}

function hideToast() {
    document.getElementById('notificationToast').classList.remove('show');
}

function showRandomMotivation() {
    const quotes = [
        {text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela"},
        {text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt"},
        {text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill"},
        {text: "The only way to do great work is to love what you do.", author: "Steve Jobs"},
        {text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson"},
        {text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt"},
        {text: "The secret of getting ahead is getting started.", author: "Mark Twain"},
        {text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius"}
    ];
    
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    document.getElementById('motivationText').textContent = `"${randomQuote.text}"`;
    document.querySelector('.motivational-quote small').textContent = `- ${randomQuote.author}`;
}

function updateBadgeCounts() {
    const pendingTasks = tasks.filter(task => !task.completed).length;
    const upcomingDeadlines = deadlines.filter(d => {
        const deadlineDate = new Date(d.date);
        const now = new Date();
        return deadlineDate >= now;
    }).length;
    
    document.getElementById('taskBadge').textContent = pendingTasks;
    document.getElementById('deadlineBadge').textContent = upcomingDeadlines;
}

function setupEventListeners() {
    // (Enter key to add task)
    document.getElementById('taskInput')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTask();
        }
    });
    
    // (Enter key to save note)
    document.getElementById('noteContent')?.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'Enter') {
            saveNote();
        }
    });
    
    // (Close modal when clicking outside)
    window.addEventListener('click', function(e) {
        const modal = document.getElementById('addClassModal');
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // (Update dashboard every minute)
    setInterval(updateDashboardStats, 60000);
    
    // (Check for notifications every 30 seconds)
    setInterval(checkDeadlineNotifications, 30000);
}