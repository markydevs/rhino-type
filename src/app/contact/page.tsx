"use client";

import React, { useState, useEffect } from "react";
import GithubIcon from "../../../public/github-icon.svg";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/Navbar";

const Contact = () => {
	const [emailSubmitted, setEmailSubmitted] = useState(false);
	const [currentTheme] = useState("light"); // Default theme

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const target = e.target as HTMLFormElement;
		const data = {
			email: (target.elements.namedItem("email") as HTMLInputElement).value,
			subject: (target.elements.namedItem("subject") as HTMLInputElement).value,
			message: (target.elements.namedItem("message") as HTMLTextAreaElement)
				.value,
		};

		const response = await fetch("/api/send", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
		});

		if (response.status === 200) {
			console.log("Message sent.");
			setEmailSubmitted(true);
		}
	};

	// Apply theme to the body or relevant container
	useEffect(() => {
		document.documentElement.setAttribute("data-theme", currentTheme);
	}, [currentTheme]);

	return (
		<>
			<Navbar />
			<section className="relative flex flex-col md:flex-row justify-center items-center my-16 px-6 md:px-16 py-24 gap-12">
				{/* Background Glow */}
				<div className="absolute inset-0 flex justify-center items-center">
					<div className="bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-900 to-transparent rounded-full w-96 h-96 blur-3xl opacity-40"></div>
				</div>

				{/* Contact Info */}
				<div className="z-10 max-w-lg text-center md:text-left">
					<h5
						className="text-2xl font-bold mb-4"
						style={{ color: "var(--text-color)" }}>
						Let&apos;s Connect
					</h5>
					<p className="mb-6" style={{ color: "var(--text-color)" }}>
						I&apos;m currently looking for new opportunities. Whether you have a
						question or just want to say hi, I&apos;ll try my best to get back
						to you!
					</p>
					<div className="flex gap-4">
						<Link target="_blank" href="https://github.com/markydevs">
							<Image
								src={GithubIcon}
								alt="Github Icon"
								width={32}
								height={32}
								className="hover:scale-110 transition-transform"
							/>
						</Link>
					</div>
				</div>

				{/* Contact Form */}
				<div
					className="z-10 w-full max-w-md p-6 rounded-lg shadow-lg border"
					style={{
						backgroundColor: "var(--sub-color)",
						borderColor: "var(--border-color)",
					}}>
					{emailSubmitted ? (
						<p
							className="text-center font-medium"
							style={{ color: "var(--success-text-color)" }}>
							Email sent successfully!
						</p>
					) : (
						<form className="flex flex-col" onSubmit={handleSubmit}>
							<div className="mb-5">
								<label
									htmlFor="email"
									className="block text-sm font-medium mb-2"
									style={{ color: "var(--text-color)" }}>
									Email
								</label>
								<input
									name="email"
									type="email"
									id="email"
									required
									className="w-full p-3 border text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500"
									style={{
										backgroundColor: "var(--input-bg-color)",
										color: "var(--input-text-color)",
										borderColor: "var(--border-color)",
									}}
									placeholder="johnsmith@gmail.com"
								/>
							</div>

							<div className="mb-5">
								<label
									htmlFor="subject"
									className="block text-sm font-medium mb-2"
									style={{ color: "var(--text-color)" }}>
									Subject
								</label>
								<input
									name="subject"
									type="text"
									id="subject"
									required
									className="w-full p-3 border text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500"
									style={{
										backgroundColor: "var(--input-bg-color)",
										color: "var(--input-text-color)",
										borderColor: "var(--border-color)",
									}}
									placeholder="Just saying hi"
								/>
							</div>

							<div className="mb-5">
								<label
									htmlFor="message"
									className="block text-sm font-medium mb-2"
									style={{ color: "var(--text-color)" }}>
									Message
								</label>
								<textarea
									name="message"
									id="message"
									className="w-full p-3 border text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500"
									style={{
										backgroundColor: "var(--input-bg-color)",
										color: "var(--input-text-color)",
										borderColor: "var(--border-color)",
									}}
									placeholder="Let's talk about..."
									rows={4}
								/>
							</div>

							<button
								type="submit"
								className="w-full py-3 font-medium rounded-lg transition-all"
								style={{
									backgroundColor: "var(--main-color)",
									color: "black",
								}}>
								Send Message
							</button>
						</form>
					)}
				</div>
			</section>
		</>
	);
};

export default Contact;
