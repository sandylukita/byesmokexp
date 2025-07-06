// Setup admin account in Firebase
const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, updateProfile } = require('firebase/auth');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCzKtmjJoEqlnmTVroW2j3kX11sTMPXSB8",
  authDomain: "byesmokexp.firebaseapp.com",
  projectId: "byesmokexp",
  storageBucket: "byesmokexp.firebasestorage.app",
  messagingSenderId: "161013631866",
  appId: "1:161013631866:web:2fdfca241dd7f0224c24c3",
  measurementId: "G-XYDB63TDSZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function setupAdmin() {
  try {
    console.log('Creating admin account...');
    
    // Create admin user
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      'admin@byerokok.app', 
      'password123'
    );
    
    const user = userCredential.user;
    
    // Update display name
    await updateProfile(user, { displayName: 'Admin User' });
    
    // Create admin user document with pre-filled data
    const adminData = {
      id: user.uid,
      email: 'admin@byerokok.app',
      displayName: 'Admin User',
      isPremium: true,
      quitDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      cigarettesPerDay: 20,
      cigarettePrice: 25000,
      streak: 12,
      totalDays: 15,
      xp: 450,
      level: 2,
      lastCheckIn: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      badges: [
        {
          id: 'first-day',
          name: 'Langkah Pertama',
          description: 'Melakukan check-in pertama kali',
          icon: 'play-circle',
          color: '#2ECC71',
          unlockedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          requirement: 'Check-in pertama'
        }
      ],
      completedMissions: [
        {
          id: 'mission-1',
          title: 'Check-in Harian',
          description: 'Lakukan check-in hari ini',
          xpReward: 10,
          isCompleted: true,
          completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          isAIGenerated: false,
          difficulty: 'easy'
        }
      ],
      settings: {
        darkMode: false,
        notifications: true,
        language: 'id',
        reminderTime: '09:00'
      }
    };
    
    // Save to Firestore
    const userDoc = doc(db, 'users', user.uid);
    await setDoc(userDoc, adminData);
    
    console.log('Admin account created successfully!');
    console.log('Email: admin@byerokok.app');
    console.log('Password: password123');
    console.log('User ID:', user.uid);
    
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('Admin account already exists!');
    } else {
      console.error('Error creating admin account:', error);
    }
  }
}

setupAdmin().then(() => {
  console.log('Setup complete!');
  process.exit(0);
}).catch((error) => {
  console.error('Setup failed:', error);
  process.exit(1);
});