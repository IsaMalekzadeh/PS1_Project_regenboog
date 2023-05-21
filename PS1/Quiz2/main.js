let quizQuestion = document.querySelector(".quiz-question");
let answersDiv = document.querySelector(".answers-div");
let countSpans = document.querySelector(".count span");
let bulletsTimer = document.querySelector(".bullets");
let bulletsContainter = document.querySelector(".bullets .span-container");
let button = document.getElementById("button");
let colorCounter = 0;
let resultsDiv = document.querySelector(".result");
let countdownElement = document.querySelector(".countdown");

// Set options
let currentIndex = 0;
let rightAnswers = 0;
let countdownDuration = 90;
let countdownInterval;

function createBullets(num) {
	countSpans.innerHTML = num;

	// Create spans
	for (let i = 0; i < num; i++) {
		let bullet = document.createElement("span");
		bulletsContainter.appendChild(bullet);

		if (i === 0) {
			bullet.classList.add("current");
		}
	}
}

function addQuestions(obj, count) {
	if (currentIndex < count) {
		// Create H2 question
		let questionElement = document.createElement("h2");
		let questionText = document.createTextNode(obj.title);
		questionElement.appendChild(questionText);
		quizQuestion.appendChild(questionElement);

		// Add answers
		for (let j = 1; j <= 4; j++) {
			let answerDiv = document.createElement("div");
			answerDiv.className = "answer";

			// Create radio input
			let radioInput = document.createElement("input");
			radioInput.name = "answer";
			radioInput.type = "radio";
			radioInput.id = `answer_${j}`;
			radioInput.dataset.answer = obj[`answer_${j}`];

			// Create label
			let label = document.createElement("label");
			label.htmlFor = `answer_${j}`;

			// Label text
			labelText = document.createTextNode(obj[`answer_${j}`]);
			label.appendChild(labelText);

			if (j === 1) {
				radioInput.checked = true;
			}

			// Add answer div
			answerDiv.appendChild(radioInput);
			answerDiv.appendChild(label);

			answersDiv.appendChild(answerDiv);
		}
	}
}

function checkAnswer(answer) {
	let answers = document.getElementsByName("answer");
	let given;
	for (let i = 0; i < answers.length; i++) {
		if (answers[i].checked) {
			given = answers[i].dataset.answer;
		}
	}

	if (answer === given) {
		rightAnswers++;
	}
}

function handleBullets() {
	let bulletsSpans = document.querySelectorAll(
		".bullets .span-container span"
	);
	let bulletsArray = Array.from(bulletsSpans);
	bulletsArray.forEach((span, index) => {
		if (currentIndex === index) {
			bulletsArray[index - 1].className = "active";
			span.className = "current";
		}
	});
}

function showResults(count, colorCounter) {
	if (colorCounter === count + 1) {
		let sheet = document.styleSheets[1].cssRules;
		sheet[19].style.backgroundColor = "#0075ff";
	}

	let result;
	if (currentIndex === count) {
		quizQuestion.remove();
		answersDiv.remove();
		bulletsTimer.remove();
		button.remove();

		if (rightAnswers > count - 10) {
			result = `<span class="nice">Goed gedaan! - ${rightAnswers} / ${count}</span>`;
		} else if (rightAnswers > 7) {
			result = `<span class="average">Het kan beter! - ${rightAnswers} / ${count}</span>`;
		} else {
			result = `<span class="bad">Er is werk aan de winkel! - ${rightAnswers} / ${count}</span>`;
		}

		resultsDiv.innerHTML = result;
	}
}

function countdown(duration, count) {
	if (currentIndex < count) {
		let minutes, seconds;
		countdownInterval = setInterval(function () {
			minutes = parseInt(duration / 60);
			seconds = parseInt(duration % 60);

			minutes = minutes < 10 ? `0${minutes}` : minutes;
			seconds = seconds < 10 ? `0${seconds}` : seconds;

			countdownElement.innerHTML = `<span class="minutes">${minutes}</span>:<span class="seconds"
						>${seconds}</span
					>`;
			if (--duration < 0) {
				clearInterval(countdownInterval);
				button.click();
			}
		}, 1000);
	}
}

function getQuestions() {
	let myRequest = new XMLHttpRequest();

	myRequest.onreadystatechange = function () {
		if (this.readyState === 4 && this.status === 200) {
			let questionObject = JSON.parse(this.responseText);
			let questionsLength = questionObject.length;

			// Add bullets
			createBullets(questionsLength);

			// Add questions
			addQuestions(questionObject[currentIndex], questionsLength);

			// Countdown
			countdown(countdownDuration, questionsLength);

			// Button onclick
			button.onclick = () => {
				if (currentIndex < questionsLength) {
					let correctAnswer =
						questionObject[currentIndex].right_answer;
					currentIndex++;
					colorCounter++;
					checkAnswer(correctAnswer, questionsLength);

					// Remove old stuff
					quizQuestion.innerHTML = "";
					answersDiv.innerHTML = "";

					// Add next question
					addQuestions(questionObject[currentIndex], questionsLength);

					// Handle bullets
					handleBullets();

					// Countdown
					clearInterval(countdownInterval);
					countdown(countdownDuration, questionsLength);

					// Results
					showResults(questionsLength, colorCounter);
				}
			};
		}
	};

	myRequest.open("GET", "questions.json", true);
	myRequest.send();
}

getQuestions();
