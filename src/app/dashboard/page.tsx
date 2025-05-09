"use client";

import React, { useEffect, useState } from "react";
import { collection, getDocs, query } from "firebase/firestore";
import { db, auth } from "../../firebase/index.js";
import { Navbar } from "../../components/Navbar";
import { Line } from "react-chartjs-2";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
	Filler,
} from "chart.js";
import { onAuthStateChanged, User } from "firebase/auth";

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
	Filler
);

type TypingTestSession = {
	id: string;
	timestamp: { seconds: number }; // Or use Firebase Timestamp type if imported
	wpm: number;
	rawWpm: number;
	accuracy: number;
	consistency: number;
	time?: number;
	completed?: boolean;
};

const Dashboard: React.FC = () => {
	const [data, setData] = useState<TypingTestSession[]>([]);
	const [loading, setLoading] = useState(true);
	const [user, setUser] = useState<User | null>(null);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
			console.log("Auth state changed:", currentUser);
			setUser(currentUser);
		});
		return () => unsubscribe();
	}, []);

	useEffect(() => {
		const fetchData = async () => {
			if (!user) {
				console.log("No user is authenticated");
				return;
			}

			try {
				console.log("Fetching data for user:", user.uid);
				const userDocRef = collection(db, "typingTests", user.uid, "sessions");
				const q = query(userDocRef);
				const querySnapshot = await getDocs(q);
				const dataList = querySnapshot.docs.map((doc) => {
					const docData = doc.data();
					console.log("Document data:", docData);
					return {
						id: doc.id,
						timestamp: docData.timestamp,
						wpm: docData.wpm,
						rawWpm: docData.rawWpm,
						accuracy: docData.accuracy,
						consistency: docData.consistency,
						time: docData.time,
						completed: docData.completed,
					} as TypingTestSession;
				});
				console.log("Fetched data:", dataList);
				setData(dataList);
				setLoading(false);
			} catch (error) {
				console.error("Error fetching data:", error);
				setLoading(false);
			}
		};

		fetchData();
	}, [user]);

	if (loading) {
		return <div>Loading...</div>;
	}

	if (!data.length) {
		return <div>No data available</div>;
	}

	// Prepare data for charts
	const labels = data.map((item) =>
		new Date(item.timestamp.seconds * 1000).toLocaleDateString()
	);
	const wpmData = data.map((item) => item.wpm);
	const accuracyData = data.map((item) => item.accuracy);
	const consistencyData = data.map((item) => item.consistency);

	const chartData = {
		labels,
		datasets: [
			{
				label: "WPM",
				data: wpmData,
				borderColor: "rgba(75, 192, 192, 1)",
				backgroundColor: "rgba(75, 192, 192, 0.2)",
				fill: true,
			},
			{
				label: "Accuracy",
				data: accuracyData,
				borderColor: "rgba(153, 102, 255, 1)",
				backgroundColor: "rgba(153, 102, 255, 0.2)",
				fill: true,
			},
			{
				label: "Consistency",
				data: consistencyData,
				borderColor: "rgba(255, 159, 64, 1)",
				backgroundColor: "rgba(255, 159, 64, 0.2)",
				fill: true,
			},
		],
	};

	const chartOptions = {
		responsive: true,
		plugins: {
			legend: {
				position: "top" as const,
			},
			title: {
				display: true,
				text: "Typing Test Performance",
			},
		},
	};

	const testsStarted = data.length;
	const testsCompleted = data.filter((test) => test.completed).length;
	const completionRate = ((testsCompleted / testsStarted) * 100).toFixed(1);
	const restartsPerTest =
		(testsStarted - testsCompleted) / (testsCompleted || 1);
	const totalTime = data.reduce((sum, test) => sum + (test.time || 0), 0);
	const formatTime = (seconds: number) => {
		if (isNaN(seconds) || seconds < 0) return "00:00:00";
		return new Date(seconds * 1000).toISOString().substring(11, 19);
	};

	const wpmList = data.map((test) => test.wpm);
	const rawWpmList = data.map((test) => test.rawWpm);
	const accuracyList = data.map((test) => test.accuracy);
	const consistencyList = data.map((test) => test.consistency);

	const last10 = (arr: number[]) => arr.slice(-10);
	const avg = (arr: number[]) =>
		arr.length
			? (arr.reduce((sum, val) => sum + val, 0) / arr.length).toFixed(1)
			: "0";

	const stats = [
		{ label: "Tests Started", value: testsStarted },
		{
			label: "Tests Completed",
			value: `${testsCompleted} (${completionRate}%)`,
		},
		{ label: "Restarts per Completed Test", value: restartsPerTest.toFixed(1) },
		{ label: "Time Typing", value: formatTime(totalTime) },
		{ label: "Highest WPM", value: Math.max(...wpmList, 0) },
		{ label: "Average WPM", value: avg(wpmList) },
		{ label: "Average WPM (Last 10)", value: avg(last10(wpmList)) },
		{ label: "Highest Raw WPM", value: Math.max(...rawWpmList, 0) },
		{ label: "Average Raw WPM", value: avg(rawWpmList) },
		{ label: "Average Raw WPM (Last 10)", value: avg(last10(rawWpmList)) },
		{ label: "Highest Accuracy", value: `${Math.max(...accuracyList, 0)}%` },
		{ label: "Avg Accuracy", value: `${avg(accuracyList)}%` },
		{ label: "Avg Accuracy (Last 10)", value: `${avg(last10(accuracyList))}%` },
		{
			label: "Highest Consistency",
			value: `${Math.max(...consistencyList, 0)}%`,
		},
		{ label: "Avg Consistency", value: `${avg(consistencyList)}%` },
		{
			label: "Avg Consistency (Last 10)",
			value: `${avg(last10(consistencyList))}%`,
		},
	];
	return (
		<div>
			<Navbar />
			<div className="container mx-auto p-4">
				<h1 className="text-2xl font-bold mb-4">Dashboard</h1>
				{/* Stats Overview */}
				{/* Stats Grid */}
				<div className="grid grid-cols-3 gap-4 mb-6">
					{stats.map((stat, index) => (
						<div key={index} className="p-4 bg-white rounded-lg shadow-md">
							<h2 className="text-lg font-semibold">{stat.label}</h2>
							<p className="text-2xl font-bold">{stat.value}</p>
						</div>
					))}
				</div>
				<div className="mb-8">
					<Line data={chartData} options={chartOptions} />
				</div>
				<h2 className="text-xl font-bold mb-4">Test Data</h2>
				<table className="min-w-full bg-white">
					<thead>
						<tr>
							<th className="py-2 px-4 border-b">Date</th>
							<th className="py-2 px-4 border-b">WPM</th>
							<th className="py-2 px-4 border-b">Accuracy</th>
							<th className="py-2 px-4 border-b">Consistency</th>
						</tr>
					</thead>
					<tbody>
						{data.map((item) => (
							<tr key={item.id}>
								<td className="py-2 px-4 border-b">
									{new Date(item.timestamp.seconds * 1000).toLocaleDateString()}
								</td>
								<td className="py-2 px-4 border-b">{item.wpm}</td>
								<td className="py-2 px-4 border-b">{item.accuracy}%</td>
								<td className="py-2 px-4 border-b">{item.consistency}%</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default Dashboard;
