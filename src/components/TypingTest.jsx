"use client";

import { useState, useEffect, useCallback } from "react";
import { generateWords } from "@/utils/wordGenerator";
import "../app/TypingTest.css";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
	BarController,
	BarElement,
	Filler,
	LineController,
	ScatterController,
	TimeScale,
	TimeSeriesScale,
} from "chart.js";
import chartAnnotation from "chartjs-plugin-annotation";
import chartTrendline from "chartjs-plugin-trendline";
import { Line } from "react-chartjs-2";

import { collection, addDoc } from "firebase/firestore";
import { db, auth } from "../firebase/index.js"; // Import Firestore and Auth
import { useTest } from "../context/TestContext";

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
	BarController,
	BarElement,
	Filler,
	LineController,
	ScatterController,
	TimeScale,
	TimeSeriesScale,
	chartTrendline,
	chartAnnotation
);

ChartJS.defaults.color = "#666";
ChartJS.defaults.scale.grid.color = "#333";

const TypingTest = () => {
	const { testSettings } = useTest();
	const [isBlurred, setIsBlurred] = useState(true);
	const [text, setText] = useState("");
	const [userInput, setUserInput] = useState("");
	const [currentIndex, setCurrentIndex] = useState(0);
	const [correctCount, setCorrectCount] = useState(0);
	const [incorrectCount, setIncorrectCount] = useState(0);
	const [startTime, setStartTime] = useState(null);
	const [wpm, setWpm] = useState(0);
	const [rawWpm, setRawWpm] = useState(0);
	const [accuracy, setAccuracy] = useState(100);
	const [consistency, setConsistency] = useState(100);
	const [timeData, setTimeData] = useState([]);
	const [rawWpmData, setRawWpmData] = useState([]);
	const [wpmData, setWpmData] = useState([]);
	const [errorPoints, setErrorPoints] = useState([]);
	const [isTyping, setIsTyping] = useState(false);
	const [isTestComplete, setIsTestComplete] = useState(false);
	const [prevTimeElapsed, setPrevTimeElapsed] = useState(0);
	const [lastSecondErrors, setLastSecondErrors] = useState(0);
	const [timeLeft, setTimeLeft] = useState(0);

	useEffect(() => {
		if (testSettings.type === "words") {
			setText(generateWords(testSettings.wordCount).join(" "));
		} else {
			setText(generateWords(100).join(" ")); // Generate more words for timed tests
		}
	}, [testSettings]);

	useEffect(() => {
		if (startTime && currentIndex > 0 && !isTestComplete) {
			const timeElapsed = (Date.now() - startTime) / 1000; // Convert to seconds
			const currentSecond = Math.floor(timeElapsed);

			// End test if time limit is reached in timed mode
			if (
				testSettings.type === "time" &&
				timeElapsed >= testSettings.timeLimit
			) {
				setIsTestComplete(true);
				return;
			}

			// Only calculate and set WPM after 1 second
			if (timeElapsed > 1) {
				const totalChars = currentIndex;
				const rawWpm = parseFloat(
					(totalChars / 5 / (timeElapsed / 60)).toFixed(2)
				);
				const correctChars = userInput
					.split("")
					.filter((char, index) => char === text[index]).length;
				const currentWpm = parseFloat(
					(correctChars / 5 / (timeElapsed / 60)).toFixed(2)
				);
				const currentAccuracy = parseFloat(
					((correctCount / (correctCount + incorrectCount)) * 100).toFixed(2)
				);

				setRawWpm(rawWpm);
				setWpm(currentWpm);
				setAccuracy(currentAccuracy);

				setTimeData((prev) => [...prev, parseFloat(timeElapsed.toFixed(2))]);
				setRawWpmData((prev) => [...prev, rawWpm]);
				setWpmData((prev) => [...prev, currentWpm]);

				if (currentSecond !== prevTimeElapsed) {
					const newErrors = incorrectCount - lastSecondErrors;
					if (newErrors > 0) {
						setErrorPoints((prev) => [
							...prev,
							{
								x: timeElapsed.toFixed(2),
								y: newErrors,
							},
						]);
					}
					setLastSecondErrors(incorrectCount);
					setPrevTimeElapsed(currentSecond);
				}
			}
		}
	}, [
		currentIndex,
		correctCount,
		incorrectCount,
		startTime,
		isTestComplete,
		text,
		userInput,
		prevTimeElapsed,
		lastSecondErrors,
		testSettings,
	]);

	useEffect(() => {
		if (isTestComplete) {
			const meanRawWpm =
				rawWpmData.reduce((a, b) => a + b, 0) / rawWpmData.length;
			const variance =
				rawWpmData.reduce((a, b) => a + Math.pow(b - meanRawWpm, 2), 0) /
				rawWpmData.length;
			const coefficientOfVariation = Math.sqrt(variance) / meanRawWpm;
			const consistency = Math.max(0, 100 - coefficientOfVariation * 100);
			setConsistency(consistency);
			saveTypingTest(wpm, accuracy, consistency, rawWpmData, errorPoints);
		}
	}, [isTestComplete, rawWpmData]);

	useEffect(() => {
		let timerInterval;
		if (testSettings.type === "time" && startTime && !isTestComplete) {
			setTimeLeft(testSettings.timeLimit);
			timerInterval = setInterval(() => {
				const elapsed = Math.floor((Date.now() - startTime) / 1000);
				const remaining = testSettings.timeLimit - elapsed;
				setTimeLeft(remaining);

				if (remaining <= 0) {
					clearInterval(timerInterval);
				}
			}, 1000);
		}

		return () => {
			if (timerInterval) {
				clearInterval(timerInterval);
			}
		};
	}, [startTime, testSettings, isTestComplete]);

	const handleKeyPress = useCallback(
		(e) => {
			if (isBlurred) return;
			if (isTestComplete) return;
			const char = e.key;
			if (!text) return;

			if (char === "Backspace") {
				if (currentIndex > 0) {
					const wasCorrect =
						userInput[currentIndex - 1] === text[currentIndex - 1];
					setUserInput((prev) => prev.slice(0, -1));
					setCurrentIndex((prev) => prev - 1);
					if (wasCorrect) setCorrectCount((prev) => prev - 1);
					else setIncorrectCount((prev) => prev - 1);
				}
			} else if (char.length === 1 && !e.ctrlKey && !e.altKey) {
				if (!startTime) setStartTime(Date.now());
				const isCorrect = char === text[currentIndex];
				setUserInput((prev) => prev + char);
				setCurrentIndex((prev) => prev + 1);
				if (isCorrect) setCorrectCount((prev) => prev + 1);
				else setIncorrectCount((prev) => prev + 1);
				setIsTyping(true);
				if (currentIndex + 1 === text.length) {
					setIsTestComplete(true);
				}
			}
		},
		[currentIndex, text, userInput, startTime, isTestComplete, isBlurred]
	);

	useEffect(() => {
		document.addEventListener("keydown", handleKeyPress);
		return () => {
			document.removeEventListener("keydown", handleKeyPress);
		};
	}, [handleKeyPress]);

	const chartData = {
		labels: timeData,
		datasets: [
			{
				label: "Raw WPM",
				data: rawWpmData,
				borderColor: "rgba(125, 125, 255, 0.75)",
				backgroundColor: "transparent",
				tension: 0.4,
				pointRadius: 0,
				borderWidth: 2,
				order: 2,
				yAxisID: "wpm",
			},
			{
				label: "WPM",
				data: wpmData,
				borderColor: "#e2b714",
				backgroundColor: "transparent",
				tension: 0.4,
				pointRadius: 0,
				borderWidth: 2,
				order: 1,
				yAxisID: "wpm",
			},
			{
				label: "Errors",
				data: errorPoints,
				pointStyle: "crossRot",
				pointRadius: 4,
				pointBackgroundColor: "#ca4754",
				pointBorderColor: "#ca4754",
				showLine: false,
				order: 0,
				yAxisID: "error",
				type: "scatter",
			},
		],
	};

	const chartOptions = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				display: true,
				labels: {
					color: "#d1d0c5",
				},
			},
			tooltip: {
				enabled: true,
				backgroundColor: "#333",
				titleColor: "#d1d0c5",
				bodyColor: "#d1d0c5",
			},
		},
		scales: {
			x: {
				type: "linear",
				title: {
					display: true,
					text: "Time (seconds)",
					color: "#d1d0c5",
				},
				grid: {
					color: "#444",
				},
				ticks: {
					color: "#d1d0c5",
					maxTicksLimit: 14,
					stepSize: 3,
					callback: function (value) {
						return Math.floor(value);
					},
				},
			},
			wpm: {
				type: "linear",
				position: "left",
				ticks: {
					padding: 10, // Add some padding for better visualization
				},
				suggestedMin: function (context) {
					const data = context.chart.data.datasets[0].data; // WPM dataset
					return Math.min(...data) - 5; // Automatically set min slightly below the lowest WPM
				},
				suggestedMax: function (context) {
					const data = context.chart.data.datasets[0].data; // WPM dataset
					return Math.max(...data) + 5; // Automatically set max slightly above the highest WPM
				},
				title: {
					display: true,
					text: "WPM",
				},
			},
			error: {
				type: "linear",
				position: "right",
				suggestedMin: 0,
				suggestedMax: 5,
				title: {
					display: true,
					text: "Errors",
				},
			},
		},
		animation: {
			duration: 0,
		},
		elements: {
			line: {
				borderJoinStyle: "round",
			},
		},
	};

	const saveTypingTest = async (
		wpm,
		accuracy,
		consistency,
		rawWpmData,
		errorPoints
	) => {
		if (!auth.currentUser) {
			console.error("No user is signed in.");
			return;
		}

		const userId = auth.currentUser.uid;

		try {
			await addDoc(collection(db, "typingTests", userId, "sessions"), {
				wpm,
				accuracy,
				consistency,
				rawWpmData,
				errorPoints,
				timestamp: new Date(),
				completed: true, // Assuming the test is completed
				time: (Date.now() - startTime) / 1000, // Total time in seconds
			});
			console.log("Typing test data saved successfully!");
		} catch (error) {
			console.error("Error saving typing test:", error);
		}
	};

	return (
		<div className="typing-test relative" style={{ padding: "20px" }}>
			{isBlurred && (
				<div
					onClick={() => setIsBlurred(false)}
					className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition duration-200 cursor-pointer z-10">
					<span className="text-xl font-semibold text-white">
						Click to Unblur
					</span>
				</div>
			)}
			<div className={`text ${isBlurred ? "filter blur-md" : ""}`}>
				{text.split("").map((char, index) => (
					<span
						key={index}
						className={`character ${
							index < currentIndex
								? userInput[index] === char
									? "correct"
									: "incorrect"
								: ""
						} ${index === currentIndex ? "last-child" : ""} ${
							isTyping ? "typing" : "idle"
						}`}>
						{char}
					</span>
				))}
			</div>

			<div className="stats" style={{ marginTop: "20px", fontSize: "2rem" }}>
				<p>WPM: {Math.round(wpm)}</p>
				<p>Raw WPM: {Math.round(rawWpm)}</p>
				<p>ACC: {accuracy.toFixed(2)}%</p>
				<p>Consistency: {consistency.toFixed(2)}%</p>
				{isTestComplete && <p>Test Complete!</p>}
				{testSettings.type === "time" && (
					<p style={{ color: timeLeft <= 5 ? "#ca4754" : "#d1d0c5" }}>
						Time Left: {timeLeft} seconds
					</p>
				)}
			</div>

			<div
				className="chart-container"
				style={{
					height: "300px",
					width: "100%",
					marginTop: "20px",
					backgroundColor: "#323437",
					display: isTestComplete ? "block" : "none",
					border: "1px solid #444",
					borderRadius: "8px",
					padding: "10px",
				}}>
				<Line data={chartData} options={chartOptions} />
			</div>
		</div>
	);
};

// i could store a map with:{x:1,wpm:5,error:2}
// and have an array [{x:1,wpm:5,error:2}, {x:1,wpm:5,error:2}} so i can store the data in fire base

export default TypingTest;
