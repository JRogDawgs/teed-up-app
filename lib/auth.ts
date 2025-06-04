import { GoogleAuthProvider, signInWithCredential, signOut as firebaseSignOut, User } from 'firebase/auth';
import { auth, db } from './firebase';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// Initialize WebBrowser for auth
WebBrowser.maybeCompleteAuthSession();

// Configure Google OAuth
const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
  clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
});

export const signInWithGoogleAsync = async () => {
  try {
    const result = await promptAsync();
    
    if (result?.type === 'success') {
      const { id_token } = result.params;
      const credential = GoogleAuthProvider.credential(id_token);
      const userCredential = await signInWithCredential(auth, credential);
      
      // Create or update user document
      await createOrUpdateUser(userCredential.user);
      
      return userCredential.user;
    }
    
    throw new Error('Google sign in was cancelled or failed');
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

// Helper function to create or update user document
const createOrUpdateUser = async (user: User) => {
  const userRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userRef);
  
  if (!userDoc.exists()) {
    // Create new user document
    await setDoc(userRef, {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      createdAt: new Date().toISOString(),
    });
  } else {
    // Update existing user document
    await setDoc(userRef, {
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
    }, { merge: true });
  }
}; 