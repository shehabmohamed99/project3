// File: frontend/app.js
const apiBaseUrl = "http://localhost:3000";

// Elements
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const registerButton = document.getElementById("register");
const loginButton = document.getElementById("login");
const quizDiv = document.getElementById("quiz");
const questionsDiv = document.getElementById("questions");
const submitButton = document.getElementById("submit");
const leaderboardDiv = document.getElementById("leaderboard");
const leaderboardList = document.getElementById("leaderboardList");

let token = "";

// Register User
registerButton.addEventListener("click", async () => {
    const username = usernameInput.value;
    const password = passwordInput.value;
    const res = await fetch(`${apiBaseUrl}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    alert(data.message || data.error);
});

// Login User
loginButton.addEventListener("click", async () => {
    const username = usernameInput.value;
    const password = passwordInput.value;
    const res = await fetch(`${apiBaseUrl}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (data.token) {
        token = data.token;
        alert("Login successful");
        loadQuizzes();
    } else {
        alert(data.error);
    }
});

// Load Quizzes
async function loadQuizzes() {
    const res = await fetch(`${apiBaseUrl}/quizzes`);
    const quizzes = await res.json();

    questionsDiv.innerHTML = "";
    quizzes.forEach((quiz, index) => {
        const questionDiv = document.createElement("div");
        questionDiv.innerHTML = `
            <p>${quiz.question}</p>
            <label><input type="radio" name="question${index}" value="A"> ${quiz.option_a}</label><br>
            <label><input type="radio" name="question${index}" value="B"> ${quiz.option_b}</label><br>
            <label><input type="radio" name="question${index}" value="C"> ${quiz.option_c}</label><br>
            <label><input type="radio" name="question${index}" value="D"> ${quiz.option_d}</label><br>
        `;
        questionsDiv.appendChild(questionDiv);
    });
    quizDiv.style.display = "block";
}

// Submit Quiz
submitButton.addEventListener("click", async () => {
    const answers = [];
    const quizQuestions = document.querySelectorAll("[name^='question']");

    quizQuestions.forEach((input) => {
        if (input.checked) {
            answers.push(input.value);
        }
    });

    const res = await fetch(`${apiBaseUrl}/submit`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, answers }),
    });
    const data = await res.json();
    alert(data.message || data.error);
});
