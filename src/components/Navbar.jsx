"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import logoImage from "/public/rhinotype_logo.png";
import ThemeSwitcher from "./ThemeSwitcher.jsx";
import { auth } from "../firebase/index.js"; // Import Firebase auth
import {
	GoogleAuthProvider,
	signInWithPopup,
	signInWithEmailAndPassword,
	createUserWithEmailAndPassword,
	onAuthStateChanged,
	signOut,
} from "firebase/auth";
import { useTest } from "../context/TestContext";

const googleProvider = new GoogleAuthProvider();

const navLinks = [
	// MAYBE global stats { title: "Stats", path: "#stats" },
	{ title: "Contact", path: "/contact/" },
];

export const Navbar = () => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isSignUp, setIsSignUp] = useState(false);
	const [user, setUser] = useState(null);
	const { testSettings, setTestSettings } = useTest();
	const [isTestSettingsOpen, setIsTestSettingsOpen] = useState(false);

	// Track authentication state
	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
			setUser(currentUser);
		});
		return () => unsubscribe();
	}, []);

	const handleGoogleSignIn = async () => {
		try {
			await signInWithPopup(auth, googleProvider);
			alert("Signed in with Google!");
			setIsModalOpen(false);
		} catch (error) {
			alert(error.message);
		}
	};

	const handleEmailSignIn = async () => {
		try {
			await signInWithEmailAndPassword(auth, email, password);
			alert("Signed in successfully!");
			setIsModalOpen(false);
		} catch (error) {
			alert(error.message);
		}
	};

	const handleSignUp = async () => {
		try {
			await createUserWithEmailAndPassword(auth, email, password);
			alert("Account created successfully!");
			setIsModalOpen(false);
		} catch (error) {
			alert(error.message);
		}
	};

	const handleLogout = async () => {
		try {
			await signOut(auth);
			alert("Logged out successfully!");
		} catch (error) {
			alert(error.message);
		}
	};

	return (
		<>
			<nav className="border-[#33353F]">
				<div className="flex container lg:py-4 flex-wrap items-center justify-between mx-auto px-4 py-2">
					<Link href="/">
						<Image
							src={logoImage}
							alt="rhino-logo"
							className="w-16 h-16 md:w-24 md:h-24 lg:w-32 lg:h-32 object-contain"
						/>
					</Link>
					<div className="flex items-center gap-4">
						<ul className="hidden md:flex space-x-6">
							{navLinks.map((link) => (
								<li key={link.title}>
									<Link href={link.path} className="hover:text-gray-400">
										{link.title}
									</Link>
								</li>
							))}
						</ul>
						{/* Theme Switcher */}
						<ThemeSwitcher />
						{/* Add Test Settings button before the login/logout section */}
						<button
							onClick={() => setIsTestSettingsOpen(true)}
							className="px-4 py-2 rounded-md hover:bg-opacity-80"
							style={{
								backgroundColor: "var(--button-bg-color)",
								color: "var(--button-text-color)",
							}}>
							Test Settings
						</button>
						{/* Show Logout if user is signed in, else show Login/Sign Up */}
						{user ? (
							<>
								<button
									className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
									onClick={handleLogout}>
									Logout
								</button>
								<Link href="/dashboard/">Dashboard</Link>
							</>
						) : (
							<button
								className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
								onClick={() => setIsModalOpen(true)}>
								Login / Sign Up
							</button>
						)}
					</div>
				</div>
			</nav>

			{/* Test Settings Modal */}
			{isTestSettingsOpen && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
					<div
						className="rounded-lg shadow-lg w-96 border p-6"
						style={{
							backgroundColor: "var(--bg-color)",
							borderColor: "var(--border-color)",
						}}>
						<div className="flex justify-between items-center mb-4">
							<h2
								className="text-xl font-bold"
								style={{ color: "var(--text-color)" }}>
								Test Settings
							</h2>
							<button
								onClick={() => setIsTestSettingsOpen(false)}
								className="text-gray-500 hover:text-gray-700">
								✕
							</button>
						</div>

						<div className="space-y-4">
							<div>
								<label
									className="block mb-2"
									style={{ color: "var(--text-color)" }}>
									Test Type
								</label>
								<select
									value={testSettings.type}
									onChange={(e) =>
										setTestSettings((prev) => ({
											...prev,
											type: e.target.value,
										}))
									}
									className="w-full p-2 rounded border"
									style={{
										backgroundColor: "var(--bg-color)",
										color: "var(--text-color)",
										borderColor: "var(--border-color)",
									}}>
									<option value="words">Words</option>
									<option value="time">Time</option>
								</select>
							</div>

							{testSettings.type === "words" ? (
								<div>
									<label
										className="block mb-2"
										style={{ color: "var(--text-color)" }}>
										Word Count
									</label>
									<select
										value={testSettings.wordCount}
										onChange={(e) =>
											setTestSettings((prev) => ({
												...prev,
												wordCount: Number(e.target.value),
											}))
										}
										className="w-full p-2 rounded border"
										style={{
											backgroundColor: "var(--bg-color)",
											color: "var(--text-color)",
											borderColor: "var(--border-color)",
										}}>
										<option value={10}>10</option>
										<option value={25}>25</option>
										<option value={50}>50</option>
										<option value={100}>100</option>
									</select>
								</div>
							) : (
								<div>
									<label
										className="block mb-2"
										style={{ color: "var(--text-color)" }}>
										Time Limit (seconds)
									</label>
									<select
										value={testSettings.timeLimit}
										onChange={(e) =>
											setTestSettings((prev) => ({
												...prev,
												timeLimit: Number(e.target.value),
											}))
										}
										className="w-full p-2 rounded border"
										style={{
											backgroundColor: "var(--bg-color)",
											color: "var(--text-color)",
											borderColor: "var(--border-color)",
										}}>
										<option value={15}>15</option>
										<option value={30}>30</option>
										<option value={60}>60</option>
										<option value={120}>120</option>
									</select>
								</div>
							)}
						</div>
					</div>
				</div>
			)}

			{/* Login Modal */}
			{isModalOpen && !user && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
					<div className="bg-white p-6 rounded-lg w-80">
						<div className="flex items-center justify-between mb-4">
							<h2 className="text-xl font-bold">
								{isSignUp ? "Sign Up" : "Login"}
							</h2>
							<svg
								onClick={() => setIsModalOpen(false)}
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								strokeWidth={1.5}
								stroke="currentColor"
								className="size-6 cursor-pointer">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M6 18 18 6M6 6l12 12"
								/>
							</svg>
						</div>
						<input
							type="email"
							placeholder="Email"
							className="w-full p-2 border border-gray-300 rounded-md mb-2"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>
						<input
							type="password"
							placeholder="Password"
							className="w-full p-2 border border-gray-300 rounded-md mb-2"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
						{isSignUp ? (
							<button
								onClick={handleSignUp}
								className="w-full p-2 bg-green-600 text-white rounded-md mb-2">
								Sign Up
							</button>
						) : (
							<button
								onClick={handleEmailSignIn}
								className="w-full p-2 bg-blue-600 text-white rounded-md mb-2">
								Sign In
							</button>
						)}
						<button
							onClick={handleGoogleSignIn}
							className="w-full p-2 bg-red-600 text-white rounded-md">
							Sign In with Google
						</button>
						<button
							onClick={() => setIsModalOpen(false)}
							className="mt-2 w-full p-2 bg-gray-400 text-white rounded-md">
							Close
						</button>
						<p className="text-center mt-2 text-sm">
							{isSignUp ? "Already have an account?" : "Don't have an account?"}
							<span
								onClick={() => setIsSignUp(!isSignUp)}
								className="text-blue-600 cursor-pointer ml-1">
								{isSignUp ? "Login" : "Sign Up"}
							</span>
						</p>
					</div>
				</div>
			)}
		</>
	);
};
