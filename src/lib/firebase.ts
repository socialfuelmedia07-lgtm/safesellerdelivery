import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Using the same project ID identified previously
const firebaseConfig = {
    projectId: "quilbox-salesandshipping",
    // In a real app, you would add apiKey, authDomain, etc. here
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;
