// Remove all import/export statements!

// Firebase config
const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: "loungef2x.firebaseapp.com",
  projectId: "loungef2x",
  storageBucket: "loungef2x.appspot.com",
  messagingSenderId: "38074061356",
  appId: "1:38074061356:web:5b8386cd6109504bdbf789",
  measurementId: "G-K0XFKT6PDT"
};

// Initialize Firebase if not already initialized
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// Add a new account to the "accounts" collection
window.addAccount = async function(accountData) {
  try {
    const docRef = await db.collection("accounts").add(accountData);
    return docRef.id;
  } catch (error) {
    console.error("Error adding account:", error);
    throw error;
  }
};

// Remove an account from the "accounts" collection by document ID
window.removeAccount = async function(accountId) {
  try {
    await db.collection("accounts").doc(accountId).delete();
    return true;
  } catch (error) {
    console.error("Error removing account:", error);
    throw error;
  }
};

// Check if an account has "Premium" set to true or false
window.CheckPremium = async function(accountId) {
  try {
    const accountRef = db.collection("accounts").doc(accountId);
    const accountSnap = await accountRef.get();
    if (accountSnap.exists) {
      const data = accountSnap.data();
      return data.Premium === true;
    } else {
      throw new Error("Account not found");
    }
  } catch (error) {
    console.error("Error checking premium status:", error);
    throw error;
  }
};