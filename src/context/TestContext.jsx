"use client";

import React, { createContext, useContext, useState } from "react";

const TestContext = createContext();

export const TestProvider = ({ children }) => {
	const [testSettings, setTestSettings] = useState({
		type: "words",
		wordCount: 50,
		timeLimit: 60,
	});

	return (
		<TestContext.Provider value={{ testSettings, setTestSettings }}>
			{children}
		</TestContext.Provider>
	);
};

export const useTest = () => useContext(TestContext);
