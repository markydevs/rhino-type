"use client";

import { Navbar } from "../components/Navbar";
import TypingTest from "../components/TypingTest";
export default function Home() {
	return (
		<main className="flex min-h-screen flex-col ">
			<Navbar />
			<div className="container mx-auto px-12 py-4 ">
				<TypingTest />
			</div>
		</main>
	);
}
//  bg-[#121212]
