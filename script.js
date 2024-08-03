document.addEventListener('DOMContentLoaded', (event) => {
    loadUsers();
});

function addUser() {
    const username = document.getElementById('username').value.trim();
    if (username) {
        fetchLeetcodeData(username);
        document.getElementById('username').value = '';
    }
}

function fetchLeetcodeData(username, callback) {
    fetch(`https://leetcode-stats-api.herokuapp.com/${username}`)
        .then(response => response.json())
        .then(data => {
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
                    submissionCalendar: data.submissionCalendar,
                    solvedToday: getSolvedToday(data),
                    solvedThisWeek: getSolvedThisWeek(data)
                };
                if (callback) callback(user);
                else {
                    saveUser(user);
                    loadUsers();
                }
            } else {
                console.error('Error retrieving user data:', data.message);
            }
        })
        .catch(error => console.error('Error fetching user data:', error));
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
        <td><button onclick="deleteUser('${user.username}')">Delete</button></td>
    `;
    scoreboard.appendChild(row);
}

function deleteUser(username) {
    let users = JSON.parse(localStorage.getItem('users')) || [];
    users = users.filter(user => user.username !== username);
    localStorage.setItem('users', JSON.stringify(users));
    loadUsers();
}

function getSolvedToday(data) {
    const today = new Date();
    const todayTimestamp = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()) / 1000;
    let solvedToday = data.submissionCalendar[todayTimestamp];
    if (!solvedToday) solvedToday = 0;
    return solvedToday;
}

function getSolvedThisWeek(user) {
    const today = new Date();
    const startOfWeek = new Date(today.setUTCDate(today.getUTCDate() - today.getUTCDay()));
    const weekStartTimestamp = Date.UTC(startOfWeek.getUTCFullYear(), startOfWeek.getUTCMonth(), startOfWeek.getUTCDate()) / 1000;
    let solvedThisWeek = 0;
    for (let timestamp in user.submissionCalendar) {
        if (timestamp >= weekStartTimestamp) {
            solvedThisWeek += user.submissionCalendar[timestamp];
        }
    }
    return solvedThisWeek;
}

function saveUser(user) {
    let users = JSON.parse(localStorage.getItem('users')) || [];
    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));
}

function loadUsers() {
    let users = JSON.parse(localStorage.getItem('users')) || [];
    users.sort((a, b) => b.solvedToday - a.solvedToday);
    document.getElementById('scoreboard').innerHTML = '';
    users.forEach(user => addUserToBoard(user));
}

function refreshStats() {
    let users = JSON.parse(localStorage.getItem('users')) || [];
    document.getElementById('scoreboard').innerHTML = '';
    users.forEach(user => {
        fetchLeetcodeData(user.username, (updatedUser) => {
            updateUser(updatedUser);
            loadUsers();
        });
    });
}

function updateUser(updatedUser) {
    let users = JSON.parse(localStorage.getItem('users')) || [];
    users = users.map(user => user.username === updatedUser.username ? updatedUser : user);
    localStorage.setItem('users', JSON.stringify(users));
}
