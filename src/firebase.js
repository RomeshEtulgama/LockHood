import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, increment, writeBatch, doc, getDoc } from "firebase/firestore";
import { getDatabase, ref, set, get, orderByChild, equalTo, query } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyDIaLpoxskuwPQGEQf9gQ6LMvZjyySk4Ng",
    authDomain: "look-hood.firebaseapp.com",
    projectId: "look-hood",
    storageBucket: "look-hood.appspot.com",
    messagingSenderId: "429532720612",
    appId: "1:429532720612:web:d487f3ce4437b75f6eebf1",
    databaseURL: "https://look-hood-default-rtdb.asia-southeast1.firebasedatabase.app"
};

const app = initializeApp(firebaseConfig);

// utils
const db = getFirestore(app);
const auth = getAuth(app);
const rtd = getDatabase(app)

//increment and decrement
const incrementByOne = increment(1)
const decrementByOne = increment(-1)

//functions
async function addData(collection_ref, payload) {
    const statsRef = doc(collection_ref, "--stats--");

    // const stats = await getDoc(statsRef)

    const batch = writeBatch(db);

    const newDocRef = doc(collection_ref)
    // payload.index = stats.data().index
    batch.set(newDocRef, payload);

    batch.set(statsRef, { index: incrementByOne, count: incrementByOne }, { merge: true });

    await batch.commit()

    return await getDoc(newDocRef);
}

// Users
async function addUser(userId, email, displayName = null) {
    set(ref(rtd, 'users/' + userId), {
        email: email,
        displayName: displayName,
        approved: false,
    });
}

async function userExists(email) {
    const q = query(ref(rtd, 'users'), orderByChild("email"), equalTo(email));
    return (await get(q).then((snapshot) => {
        return snapshot.exists()
    }))
}

async function getUser() {
    const user = await getAuth().currentUser

    if (user) {
        user.approved = await userApproved(user.email)
        user.class = await userClass(user.email)
    }

    return user;
}

async function userApproved(email) {
    var approved = false
    if (email) {
        const q = query(ref(rtd, 'users'), orderByChild("email"), equalTo(email));
        await get(q).then((snapshot) => {
            snapshot.forEach((childSnapshot) => {
                approved = childSnapshot.child("approved").val();
            });
        })
    }
    return approved;
}

async function userClass(email) {
    var user_class = null
    if (email) {
        const q = query(ref(rtd, 'users'), orderByChild("email"), equalTo(email));
        await get(q).then((snapshot) => {
            snapshot.forEach((childSnapshot) => {
                user_class = childSnapshot.child("class").val();
            });
        })
    }
    return user_class;
}

async function getUsers() {
    var users = []
    const q = query(ref(rtd, 'users'));
    await get(q).then((snapshot) => {
        snapshot.forEach((childSnapshot) => {
            const user = childSnapshot.val()
            user.uid = childSnapshot.key
            users.push(user);
        });
    })
    return users;
}

async function approveUser(userId) {
    const userRef = ref(rtd, 'users').doc(userId);
    await userRef.update({ approved: true });
}

async function disapproveUser(userId) {
    console.log(userId)
}


export {
    db,
    auth,
    rtd,
    incrementByOne,
    decrementByOne,
    addData,
    addUser,
    getUser,
    userExists,
    userApproved,
    getUsers,
    approveUser,
    disapproveUser,
}