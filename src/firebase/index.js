// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: "AIzaSyCrZ7E7vRaM9N381y-7sTfUk6UMZp9kb_8",
	authDomain: "rhino-type.firebaseapp.com",
	projectId: "rhino-type",
	storageBucket: "rhino-type.firebasestorage.app",
	messagingSenderId: "1034201095510",
	appId: "1:1034201095510:web:e611ff2bcfd39587884af7",
	measurementId: "G-7SSB4V3EFX",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
let analytics;
if (typeof window !== "undefined") {
	isSupported().then((supported) => {
		if (supported) {
			analytics = getAnalytics(app);
		}
	});
}
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, analytics };
