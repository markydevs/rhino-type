import React, { useState, useEffect } from "react";
import "../app/themes.css";

const themes = ["light", "dark", "blue", "green", "retro"];

const ThemeSwitcher = () => {
	const [currentTheme, setCurrentTheme] = useState("light");
	const [previewTheme, setPreviewTheme] = useState("");
	const [dropdownOpen, setDropdownOpen] = useState(false);

	useEffect(() => {
		// Apply the current theme or preview theme to the body
		document.body.className = previewTheme || currentTheme;
	}, [currentTheme, previewTheme]);

	const applyTheme = (themeName) => {
		setCurrentTheme(themeName);
		setPreviewTheme(""); // Reset preview
		setDropdownOpen(false); // Close dropdown
	};

	const toggleTheme = () => {
		const newTheme = currentTheme === "light" ? "dark" : "light";
		setCurrentTheme(newTheme);
	};

	return (
		<div className="relative inline-block">
			<div className="relative inline-block">
				<button
					className="btn ml-2 px-4 py-2 rounded-md"
					onClick={() => setDropdownOpen(!dropdownOpen)}>
					Available Themes
				</button>

				{dropdownOpen && (
					<ul
						className="absolute right-0 mt-2 w-32 border rounded-md shadow-lg z-222"
						style={{ zIndex: "999", backgroundColor: "var(--bg-color)" }}>
						{themes.map((theme) => (
							<li key={theme}>
								<button
									onClick={() => applyTheme(theme)}
									className="block w-full px-4 py-2 text-left hover:bg-gray-200"
									style={{ "--hover-color": "var(--main-color)" }}
									onMouseEnter={(e) =>
										(e.target.style.backgroundColor = "var(--main-color)")
									}
									onMouseLeave={(e) => (e.target.style.backgroundColor = "")}>
									{theme.charAt(0).toUpperCase() + theme.slice(1)}
								</button>
							</li>
						))}
					</ul>
				)}
			</div>
		</div>
	);
};

export default ThemeSwitcher;
