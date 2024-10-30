/**
 * Global Declarations
 */

/**
 * HTML Element Declarations
 */
const timerHours = document.querySelector(".select--hours select");
const timerMinutes = document.querySelector(".select--minutes select");
const timerSeconds = document.querySelector(".select--seconds select");

const timerSelects = document.querySelectorAll(".select");
const timerDisplay = document.querySelector(".time");
const timerTaskTitle = document.querySelector("#task-title");

const startBtn = document.querySelector(".startBtn");
const endBtn = document.querySelector(".endBtn");

const audioMoon = document.querySelector(".audioMoon");
const audioWipe = document.querySelector(".audioWipe");
const audioTick = document.querySelector(".audioTick");

const saveBtn = document.querySelector(".btnSave");

const addMinutesBtn = document.querySelector(".action__addMinutes .addMinutes");
const addSecondsBtns = document.querySelectorAll(".action__addSeconds button");

/**
 * Boolean Declarations
 * 
 * @type {Boolean}
 */
let hasStarted = false;
let hasEnded = false;
let hasPaused = false;

/**
 * Number Declarations
 * 
 * @type {Number}
 */
let countChanges = 0;
let startCounter = 0;
let endCounter = 0;
let timeInSec = 0;
let initialTimeInSec = 0;

const taskTitleMaxLength = 30;

/**
 * String Declarations
 * 
 * @type {String}
 */
let title = "";
let textFile = "";

/**
 * Tasks Data
 * 
 * @type {Array}
 */
let data = [];

//Load Data From LocalStorage
if(localStorage.length > 0) {
	const storageData = localStorage.getItem("tasks");
	data = JSON.parse(storageData);
}

/**
 * Tick Sound
 * 
 * @type {Howl}
 */
const ticks = new Howl({
	src: ['assets/sounds/24.mp3'],
	loop: true,
	volume: 0.5,
});

/**
 * ticks Event Listener
 * 
 * @param {String} play
 * @param {Function}
 * @fires ticks#play
 */
ticks.on('play', function(){
	const fadeouttime = 2000;

	setTimeout(function() {
		ticks.fade(0.3, 0, fadeouttime);
	}, (ticks.duration() - ticks.seek()) * 1000 - fadeouttime);
});

//Load Hours
for (let i = 0; i < 24; i++) {
	const newOption = document.createElement("option");

	newOption.setAttribute("value", i);
	newOption.innerText = i;

	timerHours.append(newOption);
}

//Load Minutes and Seconds
for (let i = 0; i < 60; i++) {
	const newOption1 = document.createElement("option");
	const newOption2 = document.createElement("option");

	newOption1.setAttribute("value", i);
	newOption1.innerText = i;

	newOption2.setAttribute("value", i);
	newOption2.innerText = i;
	timerMinutes.append(newOption1);
	timerSeconds.append(newOption2);
}

for (timerSelect of timerSelects) {

	/**
	 * timerSelect Event Listener
	 * 
	 * @param {String} change
	 * @param {Function}
	 * @fires timerSelect#change
	 */
	timerSelect.addEventListener("change", function() {
		for (timerSelect of timerSelects) {
			timerSelect.children[1].options[0].disabled = true;
		}

		if(!hasStarted && isFinite(timerHours.value) || isFinite(timerMinutes.value) || isFinite(timerSeconds.value)) {
			let hoursText;
			let minutesText;
			let secondsText;

			countChanges++;
			if(countChanges == 1) {
				if(isFinite(timerHours.value)) {
					timerMinutes.value = 0;
					timerSeconds.value = 0;
				} else if(isFinite(timerMinutes.value)) {
					timerHours.value = 0;
					timerSeconds.value = 0;
				} else if(isFinite(timerSeconds.value)) {
					timerHours.value = 0;
					timerMinutes.value = 0;
				}
			}

			if(timerHours.value < 10) {
				hoursText = "0";
				hoursText += timerHours.value;
			} else {
				hoursText = parseInt(timerHours.value);
			}

			if(timerMinutes.value < 10) {
				minutesText = "0";
				minutesText += timerMinutes.value;
			} else {
				minutesText = parseInt(timerMinutes.value);
			}

			if(timerSeconds.value < 10) {
				secondsText = "0";
				secondsText += timerSeconds.value;
			} else {
				secondsText = parseInt(timerSeconds.value);
			}

			timerDisplay.innerText = hoursText + ":" + minutesText + ":" + secondsText;
		}
	});
}

/**
 * endBtn Event Listener - End Timer
 * 
 * @param {String} click
 * @param {Function}
 * @fires endBtn#click
 */
endBtn.addEventListener("click", () => {
	if(hasStarted) {
		endCounter++;
		if(endCounter == 1) {
			for (timerSelect of timerSelects) {
				timerSelect.children[1].options[0].disabled = false;
				timerSelect.children[1].options[1].disabled = false;
				timerSelect.style.pointerEvents = "all";
			}
			
			hasEnded = true;
			ticks.stop();
		}
	}
});

/**
 * startBtn Event Listener - Start Timer (Core Functionality)
 * 
 * @param {String} click
 * @param {Function}
 * @fires startBtn#click
 */
startBtn.addEventListener("click", function() {
	if(isFinite(timerHours.value) && isFinite(timerMinutes.value) && isFinite(timerSeconds.value) && (parseInt(timerHours.value) + parseInt(timerMinutes.value) + parseInt(timerSeconds.value)) !== 0) {
		for (timerSelect of timerSelects) {
			timerSelect.children[1].options[0].disabled = true;
			// timerSelect.children[1].options[1].disabled = true;
			timerSelect.style.pointerEvents = "none";
		}

		document.querySelector(".timerAdditions").style.display = "flex"

		startCounter++;
		if(startCounter % 2 == 0) {
			ticks.stop();
		}

		if(startCounter == 1) {
			do {
				title = prompt(`What are you using this timer for? [Max length: ${taskTitleMaxLength}]`);
				title === null ? title = "" : title;
			} 
			while(title.length > taskTitleMaxLength);

			hasStarted = true;
			const time = timerDisplay.innerText;
			const secondsArr = time.split(":");
			timeInSec = Number(secondsArr[0]) * 3600 + Number(secondsArr[1]) * 60 + Number(secondsArr[2]);
			initialTimeInSec = timeInSec;

			timerTaskTitle.innerHTML= `<b>${title}</b>`;

			let interval = setInterval(function() {
				if(startCounter % 2 != 0) {
					timeInSec--;
					
					modifyTimer();

					startBtn.innerText = "Pause";
					hasPaused = false;
				} else {
					startBtn.innerText = "Continue";
					hasPaused = true;
				}

				if(timeInSec === 0 || hasEnded) {
					setTimeout(() => {
						ticks.stop();
					}, 100);

					timerTaskTitle.innerHTML = title == "" 
					? `Timer has finished!`
					: `Timer for <b>${title}</b> has finished!`;

					writeData();
					clearInterval(interval);

					new Audio(audioWipe.src).play();
					let alarmCounter = 1;
					const alarm = setInterval(() => {
						if(alarmCounter % 2 != 0) {
							new Audio(audioMoon.src).play();
						} else {
							new Audio(audioWipe.src).play();
						}
						alarmCounter++;

						if(alarmCounter === 3) {
							clearInterval(alarm);
							ticks.stop();
						}
					}, 1375);

					reset();

				}
			}, 1000);
		}
	}
});

/**
 * saveBtn Event Listener - Save To File
 * 
 * @param {String} click
 * @param {Function}
 * @fires saveBtn#click
 */
saveBtn.addEventListener("click", saveToFile);

/**
 * addMinutesBtn Event Listener - Add minutes
 * 
 * @param {String} click
 * @param {Function}
 * @fires addMinutesBtn#click
 */
addMinutesBtn.addEventListener("click", addMinutes);

/**
 * addSecondsBtn Event Listener - Add seconds
 * 
 * @param {String} click
 * @param {Function}
 * @fires addSecondsBtn#click
 */
for(const addSecondsBtn of addSecondsBtns) {
	addSecondsBtn.addEventListener("click", addSeconds);
}

/**
 * Add minutes and modify timer
 * 
 * @return {Void}
 */
function addMinutes() {
	const minutesAdded = Number(addMinutesBtn.innerText.split(" ")[1]);
	const secondsAdded = minutesAdded * 60;

	timeInSec += secondsAdded;
	initialTimeInSec += secondsAdded;

	modifyTimer();
}

/**
 * Add seconds and modify timer
 * 
 * @return {Void}
 */
function addSeconds() {
	const secondsAdded = Number(this.innerText.split(" ")[1]);
	
	timeInSec += secondsAdded;
	initialTimeInSec += secondsAdded;

	modifyTimer();
}

/**
 * Reset Timer & Sound
 * 
 * @return {Void}
 */
function reset() {
	for (timerSelect of timerSelects) {
		timerSelect.style.pointerEvents = "all";
	}

	ticks.stop();
	hasStarted = false;
	hasEnded = false;
	startCounter = 0;
	endCounter = 0;
	countChanges = 0;
	timerDisplay.innerText = "00:00:00";
	document.querySelector("title").innerText = "Timer";
	timerHours.value = "Hours";
	timerMinutes.value = "Minutes";
	timerSeconds.value = "Seconds";
	startBtn.innerText = "Start";
	document.querySelector(".timerAdditions").style.display = "none"

	const confettiEnd = Date.now() + 1000;

	// Confetti Effect:
	const colors = ["#ffffff", "#00ecff"];

	(function frame() {
		confetti({
			particleCount: 2,
			angle: 30,
			spread: 90,
			origin: { x: 0 },
			colors: colors,
		});

		confetti({
			particleCount: 2,
			angle: 150,
			spread: 90,
			origin: { x: 1 },
			colors: colors,
		});

		if (Date.now() < confettiEnd) {
			requestAnimationFrame(frame);
		}
	}) ();
}

/**
 * Toggle Audio
 * 
 * @param  {audio} Audio To Be Played/Paused
 * @return {audio} 
 */
function togglePlay(audio) {
	return audio.playing() ? audio.stop() : setTimeout(() => {audio.play()}, 750);
}

/**
 * Write Data
 * 
 * @return {Void} Push Tasks Data To Array
 */
function writeData() {
	const time = initialTimeInSec - timeInSec;
	const duration = calculateDuration(time);
	const expectedDuration = calculateDuration(initialTimeInSec);

	data.push({title: title, time: duration, expectedTime: expectedDuration, finishedAt: getCurrentDateTimeFormatted()});
	localStorage.setItem("tasks", JSON.stringify(data));
}

/**
 * Download Text File
 * 
 * @param  {String}
 * @param  {String}
 * @param  {String}
 * @return {Void} Downloads a File
 */
function download(content, fileName, contentType) {
	const aTag = document.createElement("a");
	const file = new Blob([content], {type: contentType});
	aTag.href = URL.createObjectURL(file);
	aTag.download = fileName;
	aTag.click();
}

/**
 * Save To File
 * 
 * @return {Void} Save Data To File And Download It
 */
function saveToFile() {
	try {
		let textFile = "[Tasks]";

		const currentDate = getCurrentDateTimeFormatted().split(" ")[0];
		textFile += `\n\n# ${currentDate} #\n===================================\n`;

		//Load Data From LocalStorage
		const storageData = localStorage.getItem("tasks");
		const dataArr = JSON.parse(storageData);

		//Assign Data To textFile
		for(let i = 0; i < dataArr.length; i++) {
			const currentTime = dataArr[i].finishedAt.split(" ")[1];

			textFile += `Task ${i + 1}: ${dataArr[i].title}\nDuration: ${dataArr[i].time}\nExpected Time: ${dataArr[i].expectedTime}\nFinished At: ${currentTime}\n===================================\n`;
		}

		download(textFile, 'DigitalTimer.txt', 'text/plain');
	} catch (e) {};
}

/**
 * Generate and return formatted current datetime
 * 
 * @returns {String} Current datetime formatted (DD.MM.YYYY HH:MM:SS)
 */
function getCurrentDateTimeFormatted() {
	const currentDate = new Date();

	const day = String(currentDate.getDate()).padStart(2, '0');
	const month = String(currentDate.getMonth() + 1).padStart(2, '0');
	const year = currentDate.getFullYear();

	const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    const seconds = String(currentDate.getSeconds()).padStart(2, '0');

    return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
}

/**
 * Calculate duration in a human readable format (hours/minutes/seconds)
 * 
 * @returns The resulted duration
 */
function calculateDuration(timeInSec) {
	const timeParts = getTimeDividedFromSeconds(timeInSec);

	const hours = timeParts[0];
	const minutes = timeParts[1];
	const seconds = timeParts[2];

	let hoursStr = "";
	let minutesStr = "";
	let secondsStr = "";

	hours == 1 ? hoursStr = "hour" : hoursStr = "hours";
	minutes == 1 ? minutesStr = "minute" : minutesStr = "minutes";
	seconds == 1 ? secondsStr = "second" : secondsStr = "seconds";

	let duration = "";

	if(hours !== 0 && minutes === 0 && seconds === 0) {
		duration = `${hours} ${hoursStr}`;
	} else if(hours === 0 && minutes !== 0 && seconds === 0) {
		duration = `${minutes} ${minutesStr}`;
	} else if(hours === 0 && minutes === 0 && seconds !== 0) {
		duration = `${seconds} ${secondsStr}`;
	} else if(hours !== 0 && minutes !== 0 && seconds === 0) {
		duration = `${hours} ${hoursStr} : ${minutes} ${minutesStr}`;
	} else if(hours === 0 && minutes !== 0 && seconds !== 0) {
		duration = `${minutes} ${minutesStr} : ${seconds} ${secondsStr}`;
	} else if(hours !== 0 && minutes === 0 && seconds !== 0) {
		duration = `${hours} ${hoursStr} : ${seconds} ${secondsStr}`;
	} else if(hours !== 0 && minutes !== 0 && seconds !== 0) {
		duration = `${hours} ${hoursStr} : ${minutes} ${minutesStr} : ${seconds} ${secondsStr}`;
	}

	return duration;
}

/**
 * Get hours, minutes, seconds
 * 
 * @returns The resulted array parts from the division of seconds
 */
function getTimeDividedFromSeconds(timeInSec) {
	const hours = parseInt(timeInSec / 3600);
	const minutes = parseInt(timeInSec % 3600 / 60);
	const seconds = parseInt(timeInSec % 3600 % 60);

	return [hours, minutes, seconds];
}

/**
 * Modify timer by getting time parts and updating the timer display paragraph
 * 
 * @returns {Void}
 */
function modifyTimer() {
	const timeParts = getTimeDividedFromSeconds(timeInSec);

	// Toggle audio
	const lastSeconds = Math.ceil(initialTimeInSec * 0.4);

	if(timeInSec > 15) {
		ticks.stop();
	}

	if(timeInSec == 15 && !ticks.playing()) {
		ticks.play();
	}

	if(initialTimeInSec >= 5 && initialTimeInSec <= 15 && lastSeconds === timeInSec && !ticks.playing()) {
		ticks.play();
	}

	if(!hasPaused) {
		if(initialTimeInSec >= 5 && initialTimeInSec <= 15 && lastSeconds >= timeInSec && !ticks.playing()) {
			ticks.play();
		}

		if(initialTimeInSec >= 15 && timeInSec <= 15 && !ticks.playing()) {
			ticks.play();
		}
	} else {
		ticks.stop();
	}
	
	let hours = timeParts[0];
	let minutes = timeParts[1];
	let seconds = timeParts[2];

	if(hours < 10) {
		hours = "0" + hours;
	}

	if(minutes < 10) {
		minutes = "0" + minutes;
	}

	if(seconds < 10) {
		seconds = "0" + seconds;
	}
	const timeResult = hours + ":" + minutes + ":" +  seconds;

	timerDisplay.innerText = timeResult;
	document.querySelector("title").innerText = timeResult;
}
