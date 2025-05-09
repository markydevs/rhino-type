import React, { useEffect, useState } from "react";
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TypingTestGraph = ({
	correctCount,
	incorrectCount,
	startTime,
	currentIndex,
	isTyping,
	isTestComplete,
}) => {
	const [speedData, setSpeedData] = useState([]);

	useEffect(() => {
		if (startTime && isTyping && !isTestComplete) {
			const timeElapsed = (Date.now() - startTime) / 1000; // Time in seconds
			const currentWPM = calculateWPM(correctCount, timeElapsed);
			const accuracy = calculateAccuracy(correctCount, incorrectCount);

			setSpeedData((prev) => [
				...prev,
				{
					time: Math.floor(timeElapsed),
					wpm: currentWPM,
					accuracy: accuracy,
					raw: currentWPM * (accuracy / 100),
				},
			]);
		}
	}, [
		currentIndex,
		startTime,
		correctCount,
		incorrectCount,
		isTyping,
		isTestComplete,
	]);

	const calculateWPM = (correct, timeInSeconds) => {
		return Math.round(correct / 5 / (timeInSeconds / 60));
	};

	const calculateAccuracy = (correct, incorrect) => {
		const total = correct + incorrect;
		return total === 0 ? 100 : Math.round((correct / total) * 100);
	};

	return (
		<Card className="w-full max-w-4xl bg-gray-900 text-gray-100">
			<CardHeader>
				<CardTitle className="text-yellow-400">
					WPM: {speedData.length > 0 ? speedData[speedData.length - 1].wpm : 0}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="h-64">
					<ResponsiveContainer width="100%" height="100%">
						<LineChart
							data={speedData}
							margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
							<CartesianGrid strokeDasharray="3 3" stroke="#444" />
							<XAxis
								dataKey="time"
								stroke="#666"
								label={{ value: "Time (s)", position: "bottom", fill: "#666" }}
							/>
							<YAxis
								stroke="#666"
								label={{
									value: "Words per Minute",
									angle: -90,
									position: "left",
									fill: "#666",
								}}
							/>
							<Tooltip
								contentStyle={{
									backgroundColor: "#222",
									border: "1px solid #444",
								}}
								labelStyle={{ color: "#999" }}
							/>
							<Line
								type="monotone"
								dataKey="wpm"
								stroke="#FFD700"
								dot={false}
								strokeWidth={2}
							/>
							<Line
								type="monotone"
								dataKey="raw"
								stroke="#666"
								dot={false}
								strokeWidth={1}
							/>
						</LineChart>
					</ResponsiveContainer>
				</div>
				<div className="mt-4 grid grid-cols-3 gap-4 text-sm">
