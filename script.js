document.addEventListener('DOMContentLoaded', (event) => {
    initializeSupabase();
    loadUsers();
});

function initializeSupabase() {
    if (typeof supabase !== 'undefined') {
        console.log('Supabase is loaded');
        // REPLACE WITH YOUR SUPABASE URL AND KEY
        const SUPABASE_URL = 'https://kfcofpfbevvzobwddfwo.supabase.co';
        const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmY29mcGZiZXZ2em9id2RkZndvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjI2NTY3NzcsImV4cCI6MjAzODIzMjc3N30.DpSz965U7f3NOMbQdAQoyenNdAL2tw-_OEMJIrF0y_8';
        window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log('Supabase client initialized', supabase);
    } else {
        console.log('Supabase is not loaded');
    }
}

function addUser() {
    const username = document.getElementById('username').value.trim();
    if (username) {
        saveUser(username);
        document.getElementById('username').value = '';
    }
}

async function fetchLeetcodeData(username, callback) {
    const response = await fetch(`https://leetcode-stats-api.herokuapp.com/${username}`);
    const data = await response.json();

    if (data.status === 'success') {
        const user = {
            username: username,
            easySolved: data.easySolved,
            mediumSolved: data.mediumSolved,
            hardSolved: data.hardSolved,
            totalSolved: data.totalSolved,
            totalQuestions: data.totalQuestions,
            acceptanceRate: data.acceptanceRate,
            ranking: data.ranking,
            solvedToday: getSolvedToday(data),
            solvedThisWeek: getSolvedThisWeek(data)
        };
        if (callback) callback(user);
    } else {
        console.error('Error retrieving user data:', data.message);
    }
}

function addUserToBoard(user) {
    const scoreboard = document.getElementById('scoreboard');
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${user.username}</td>
        <td>${user.solvedToday}</td>
        <td>${user.solvedThisWeek}</td>
        <td>${user.easySolved}</td>
        <td>${user.mediumSolved}</td>
        <td>${user.hardSolved}</td>
        <td>${user.totalSolved}</td>
        <td>${user.ranking}</td>
        <td><button onclick="deleteUser('${user.username}', this)">Delete</button></td>
    `;
    scoreboard.appendChild(row);
}

async function deleteUser(username, button) {
    const { error } = await supabase
        .from('users')
        .delete()
        .eq('username', username);

    if (error) {
        console.error('Error removing user:', error);
    } else {
        console.log(`User ${username} deleted from database.`);
        const row = button.parentNode.parentNode;
        row.parentNode.removeChild(row);
    }
}

function getSolvedToday(data) {
    const today = new Date();
    const todayTimestamp = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()) / 1000;
    let solvedToday = data.submissionCalendar[todayTimestamp];
    if (!solvedToday) solvedToday = 0;
    return solvedToday;
}

function getSolvedThisWeek(data) {
    const today = new Date();
    const startOfWeek = new Date(today.setUTCDate(today.getUTCDate() - today.getUTCDay()));
    const weekStartTimestamp = Date.UTC(startOfWeek.getUTCFullYear(), startOfWeek.getUTCMonth(), startOfWeek.getUTCDate()) / 1000;
    let solvedThisWeek = 0;
    for (let timestamp in data.submissionCalendar) {
        if (timestamp >= weekStartTimestamp) {
            solvedThisWeek += data.submissionCalendar[timestamp];
        }
    }
    return solvedThisWeek;
}

async function saveUser(username) {
    const { error } = await supabase
        .from('users')
        .upsert({ username: username });

    if (error) {
        console.error('Error saving user:', error);
    } else {
        loadUsers();
    }
}

async function loadUsers() {
    console.log('Loading users...');
    const { data: users, error } = await supabase
        .from('users')
        .select('*');

    if (error) {
        console.error('Error loading users:', error);
        return;
    }

    console.log('Users loaded:', users);

    document.getElementById('scoreboard').innerHTML = '';

    for (const user of users) {
        console.log('Fetching data for user:', user.username);
        await fetchLeetcodeData(user.username, addUserToBoard);
    }
}

async function refreshStats() {
    const { data: users, error } = await supabase
        .from('users')
        .select('*');

    if (error) {
        console.error('Error loading users:', error);
        return;
    }

    document.getElementById('scoreboard').innerHTML = '';

    for (const user of users) {
        fetchLeetcodeData(user.username, addUserToBoard);
    }
}
