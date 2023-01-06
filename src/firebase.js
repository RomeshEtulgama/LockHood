import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, increment, writeBatch, doc, getDoc, collection, getDocs, updateDoc } from "firebase/firestore";
import { getDatabase, ref, set, get, orderByChild, equalTo, query, update, remove } from "firebase/database";

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

// collection refs
const rawItemsCollection = collection(db, 'rawItems')
const factoryItemsCollection = collection(db, 'factoryItems')
const ordersCollection = collection(db, 'orders')

//functions
/* Adds data to a given collection reference in a database, and increments the index and count fields of the "stats" document within the collection. It returns the newly added document. The function uses the async/await syntax to handle asynchronous actions, such as getting and setting documents with the Firestore database and committing a batch write.*/
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

/* removes a document from a specified collection in a database and updates the "--stats--" document in the same collection by decrementing the "count" field by 1. The function utilizes a write batch to atomically perform both actions in a single transaction. */
async function removeDoc(collection_ref, doc_id) {
    const statsRef = doc(collection_ref, "--stats--");

    const batch = writeBatch(db);

    const docRef = doc(collection_ref, doc_id)
    batch.delete(docRef);

    batch.set(statsRef, { count: decrementByOne }, { merge: true });

    await batch.commit()
}

//functions/users ---------------------------------------------------------------------------------------------------!

/* This function adds a user to the database with the given userId, email, and displayName. The user is initially not approved. */
async function addUser(userId, email, displayName = null) {
    set(ref(rtd, 'users/' + userId), {
        email: email,
        displayName: displayName,
        approved: false,
    });
}

/* Checks if a user with the given email exists in the database by querying the 'users' collection and ordering by the 'email' field. It returns a boolean indicating whether or not the user exists. */
async function userExists(email) {
    const q = query(ref(rtd, 'users'), orderByChild("email"), equalTo(email));
    return (await get(q).then((snapshot) => {
        return snapshot.exists()
    }))
}
/* Retrieves the current user and then checks if they are approved and assigns their class based on their email.*/
async function getUser() {
    const user = getAuth().currentUser

    if (user) {
        user.approved = await userApproved(user.email)
        user.class = await userClass(user.email)
    }

    return user;
}

/* checks if a user with the given email is approved. It creates a query to search for a user with the matching email in the 'users' collection and then checks the 'approved' field for a true value. It returns a boolean indicating whether the user is approved or not.*/
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

/* retrieves the class of a user with the given email. It creates a query to search for a user with the matching email in the 'users' collection and then retrieves the 'class' field for that user. It returns the user's class or null if no user with the given email was found. */
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

/* retrieves a list of all users from the 'users' collection in the database. It creates a query to retrieve all documents in the 'users' collection and then iterates through the snapshot of returned documents, creating a user object for each document and adding it to the users array. It returns the array of user objects. */
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

/* approves a user with the given userId by updating the 'approved' field in the user's document in the 'users' collection to true. It creates a reference to the user's document and uses the update() function to set the 'approved' field to true. */
async function approveUser(userId) {
    const userRef = ref(rtd, 'users/' + userId)
    update(userRef, {
        approved: true
    })
}

async function getUserById(userId) {
    const userRef = ref(rtd, 'users/' + userId)
    return await get(userRef).then((snapshot) => {
        if (snapshot.exists()) {
            var user = snapshot.val();
            user.uid = userId;
            return user;
        } else {
            console.log("User not available");
            return null
        }
    }).catch((error) => {
        console.error(error);
    });
}

/* disapproves a user with the given userId by updating the 'approved' field in the user's document in the 'users' collection to false. It creates a reference to the user's document and uses the update() function to set the 'approved' field to false. */
async function disapproveUser(userId) {
    const userRef = ref(rtd, 'users/' + userId)
    update(userRef, {
        approved: false
    })
}

/* changes the class of a user with the given userId by updating the 'class' field in the user's document in the 'users' collection to the specified user_class. It creates a reference to the user's document and uses the update() function to set the 'class' field to the specified user_class. */
async function changeUserClass(userId, user_class) {
    const userRef = ref(rtd, 'users/' + userId)
    update(userRef, {
        class: user_class
    })
}

async function getEmployees() {
    var employees = []
    const q = query(ref(rtd, 'users'));
    await get(q).then((snapshot) => {
        snapshot.forEach((childSnapshot) => {
            const user = childSnapshot.val()
            user.uid = childSnapshot.key
            if (user.class == 'Employee')
                employees.push(user);

        });
    })
    return employees;
}

async function getNumberOfAssignedOrders(userId) {
    var count = 0
    const userRef = ref(rtd, 'users/' + userId + '/assignedOrders')
    await get(userRef).then((snapshot) => {
        if (snapshot.exists()) {
            snapshot.forEach(() => {
                count++
            });
        } else {
            count = 0
        }
    }).catch((error) => {
        console.error(error);
    });

    return count;
}

//functions/rawItems ---------------------------------------------------------------------------------------------------!

/* adds an item to the "rawItems" collection in a database with the specified name and quantity. */
async function addRawItem(itemName, quantity) {
    await this.addData(rawItemsCollection, {
        itemName: itemName,
        quantity: quantity
    })
}

/* retrieves all documents from the "rawItems" collection in a database and returns them as an array of objects. Each object in the array contains the fields "itemName" and "quantity" from the corresponding document in the collection, as well as an additional field "id" which is the document ID. */
async function getRawItems() {
    var items = []
    const querySnapshot = await getDocs(rawItemsCollection);
    querySnapshot.forEach((doc) => {
        var item = doc.data()
        if (item.itemName && item.quantity) {
            item.id = doc.id
            items.push(item)
        }
    });

    return items
}

async function getRawItem(itemId) {
    const docRef = doc(rawItemsCollection, itemId)
    return await (await getDoc(docRef)).data()
}

/* removes a document with the specified ID from the "rawItems" collection in a database. */
async function deleteRawItem(itemId) {
    await removeDoc(rawItemsCollection, itemId)
}

/* updates the "quantity" field of a document with the specified ID in the "rawItems" collection in a database. */
async function updateRawItemQuantity(itemId, quantity) {
    const docRef = doc(rawItemsCollection, itemId)

    await updateDoc(docRef, {
        quantity: quantity
    });
}

async function updateRawItemAlertQuantity(itemId, alertQuantity) {
    const docRef = doc(rawItemsCollection, itemId)

    await updateDoc(docRef, {
        alertQuantity: alertQuantity
    });
}

async function updateRawItemName(itemId, itemName) {
    const docRef = doc(rawItemsCollection, itemId)

    await updateDoc(docRef, {
        itemName: itemName
    });
}


//functions/factoryItems ---------------------------------------------------------------------------------------------------!

/* adds an item to the "factoryItems" collection in a database with the specified name and quantity. */
async function addFactoryItem(item) {
    await this.addData(factoryItemsCollection, item)
}

/* retrieves all documents from the "factoryItems" collection in a database and returns them as an array of objects. Each object in the array contains the fields "itemName" and "quantity" from the corresponding document in the collection, as well as an additional field "id" which is the document ID. */
async function getFactoryItems() {
    var products = []
    const querySnapshot = await getDocs(factoryItemsCollection);
    querySnapshot.forEach((doc) => {
        var product = doc.data()
        if (product.productName) {
            product.id = doc.id
            product.required_raw_items.forEach(async rawItem => {
                var item = await this.getRawItem(rawItem.rawItem)
                rawItem.rawItem = item.itemName
            })
            products.push(product)
        }
    });

    // console.log(products)

    return products
}

async function getFactoryItem(itemId) {
    const docRef = doc(factoryItemsCollection, itemId)
    return await (await getDoc(docRef)).data()
}

async function updateFactoryItem(itemId, payload) {
    const docRef = doc(factoryItemsCollection, itemId)
    await updateDoc(docRef, payload)
}

/* removes a document with the specified ID from the "factoryItems" collection in a database. */
async function deleteFactoryItem(itemId) {
    await removeDoc(factoryItemsCollection, itemId)
}

/* updates the "quantity" field of a document with the specified ID in the "factoryItems" collection in a database.*/
async function updateFactoryItemQuantity(itemId, quantity) {
    const docRef = doc(factoryItemsCollection, itemId)

    await updateDoc(docRef, {
        quantity: Number(quantity)
    });
}

//functions/orders ---------------------------------------------------------------------------------------------------!

/* retrieves all documents from the "orders" collection in a database and returns them as an array of objects. Each object in the array contains the field "customer" from the corresponding document in the collection, as well as an additional field "id" which is the document ID. If the document contains a field "customLockType", it is added to the object as a field "lockType". */
async function getOrders() {
    var orders = []
    const querySnapshot = await getDocs(ordersCollection);
    querySnapshot.forEach((doc) => {
        var order = doc.data()
        if (order.customer) {
            order.id = doc.id
            orders.push(order)
        }
    });
    return orders
}

/* adds an order to the "orders" collection in a database with the specified customer, lock type, custom lock type, description, and quantity. If the lock type is "Custom", the custom lock type field is required. */
async function addOrder(order) {
    await this.addData(ordersCollection, {
        customer: order.customer,
        lockType: order.lockType,
        quantity: order.quantity,
        deliveryDate: order.deliveryDate,
    })
}

/*  removes a document with the specified ID from the "orders" collection in a database. */
async function deleteOrder(orderId) {
    const orderRef = doc(ordersCollection, orderId)

    const order = await (await getDoc(orderRef)).data()

    if (order.accepted)
        await this.unacceptOrder(order)

    await removeDoc(ordersCollection, orderId)
}

/* updates the "quantity" field of a document with the specified ID in the "orders" collection in a database. */
async function updateOrderQuantity(itemId, quantity) {
    const docRef = doc(ordersCollection, itemId)

    await updateDoc(docRef, {
        quantity: quantity
    });
}

async function updateOrderCustomer(itemId, customer) {
    const docRef = doc(ordersCollection, itemId)
    await updateDoc(docRef, {
        customer: customer
    });
}

async function updateOrderLockType(itemId, lockType) {
    const docRef = doc(ordersCollection, itemId)
    await updateDoc(docRef, {
        lockType: lockType
    });
}

async function updateOrderDeliveryDate(itemId, deliveryDate) {
    const docRef = doc(ordersCollection, itemId)
    await updateDoc(docRef, {
        deliveryDate: deliveryDate
    });
}

async function getPendingOrders() {
    var pendingOrders = []
    const querySnapshot = await getDocs(ordersCollection);
    querySnapshot.forEach((doc) => {
        var pendingOrder = doc.data()
        if (pendingOrder.customer && !pendingOrder.accepted) {
            pendingOrder.id = doc.id
            if (pendingOrder.customLockType) {
                pendingOrder.lockType = pendingOrder.customLockType
            }
            pendingOrders.push(pendingOrder)
        }
    });

    return pendingOrders
}

async function getAcceptedOrders() {
    var acceptedOrders = []
    const querySnapshot = await getDocs(ordersCollection);

    await querySnapshot.forEach((doc) => {
        var acceptedOrder = doc.data()
        if (acceptedOrder.accepted) {
            acceptedOrder.id = doc.id
            acceptedOrder.assignedEmployees.forEach(async (assignedEmployee) => {
                var user = await getUserById(assignedEmployee.uid)
                assignedEmployee.employee = user.displayName
                assignedEmployee.uid = user.uid
                assignedEmployee.quantity = Number(assignedEmployee.quantity)
            })
            acceptedOrders.push(acceptedOrder)
        }
    });
    return acceptedOrders
}

async function acceptOrder(item) {
    const orderRef = doc(ordersCollection, item.id)

    const order = await (await getDoc(orderRef)).data()
    const product = await this.getFactoryItem(order.lockType)

    const batch = writeBatch(db);

    product.required_raw_items.forEach(rawItem => {
        var reducingQuantity = increment(-1 * rawItem.quantity * order.quantity)
        const rawItemRef = doc(rawItemsCollection, rawItem.rawItem)
        batch.update(rawItemRef, { quantity: reducingQuantity });
    })

    batch.update(orderRef, {
        accepted: true,
        assignedEmployees: item.assignedEmployees
    });

    item.assignedEmployees.forEach(assignedEmployee => {
        const employeeRef = ref(rtd, 'users/' + assignedEmployee.uid + '/assignedOrders/' + item.id)
        update(employeeRef, {
            quantity: item.quantity
        })
    })

    await batch.commit()

}

async function unacceptOrder(item) {
    const orderRef = doc(ordersCollection, item.id)

    const order = await (await getDoc(orderRef)).data()

    const product = await this.getFactoryItem(order.lockType)

    const batch = writeBatch(db);

    product.required_raw_items.forEach(rawItem => {
        var reducingQuantity = increment(rawItem.quantity * order.quantity)
        const rawItemRef = doc(rawItemsCollection, rawItem.rawItem)
        batch.update(rawItemRef, { quantity: reducingQuantity });
    })

    batch.update(orderRef, {
        accepted: false,
        assignedEmployees: ""
    });


    item.assignedEmployees.forEach(assignedEmployee => {
        const employeeRef = ref(rtd, 'users/' + assignedEmployee.uid + '/assignedOrders/' + item.id)
        remove(employeeRef)
    })

    await batch.commit()

}

async function updateOrder(item) {
    const orderRef = doc(ordersCollection, item.id)

    const batch = writeBatch(db);

    batch.update(orderRef, {
        assignedEmployees: item.assignedEmployees
    });

    item.assignedEmployees.forEach(assignedEmployee => {
        const employeeRef = ref(rtd, 'users/' + assignedEmployee.uid + '/assignedOrders/' + item.id)
        update(employeeRef, {
            quantity: item.quantity
        })
    })

    await batch.commit()
    // item.kanBan_info.assigned_employees.forEach(async employee => {
    //     const userRef = ref(rtd, 'users/' + employee)
    //     await update(userRef, {
    //         'assigned_orders': item
    //     })
    // })

}

async function updateFinishedQuantity(item) {
    const orderRef = doc(ordersCollection, item.id)

    var finishedQuantity = item.assignedEmployees.reduce((total, employee) => total + (Number(employee.finishedQuantity) ? Number(employee.finishedQuantity) : 0), 0);

    const batch = writeBatch(db);

    batch.update(orderRef, {
        finishedQuantity: Number(finishedQuantity)
    });

    item.assignedEmployees.forEach(assignedEmployee => {
        const employeeRef = ref(rtd, 'users/' + assignedEmployee.uid + '/assignedOrders/' + item.id)
        update(employeeRef, {
            finishedQuantity: Number(assignedEmployee.finishedQuantity)
        })
    })

    await batch.commit()
}



export {
    db,
    auth,
    rtd,
    incrementByOne,
    decrementByOne,
    addData,
    removeDoc,
    addUser,
    getUser,
    userExists,
    userApproved,
    getUsers,
    approveUser,
    disapproveUser,
    changeUserClass,
    addRawItem,
    getRawItems,
    getRawItem,
    deleteRawItem,
    updateRawItemQuantity,
    addFactoryItem,
    getFactoryItems,
    deleteFactoryItem,
    updateFactoryItemQuantity,
    getOrders,
    addOrder,
    deleteOrder,
    updateOrderQuantity,
    getPendingOrders,
    acceptOrder,
    getEmployees,
    updateRawItemName,
    getFactoryItem,
    updateFactoryItem,
    updateOrderCustomer,
    updateOrderLockType,
    updateOrderDeliveryDate,
    getAcceptedOrders,
    getUserById,
    unacceptOrder,
    updateOrder,
    getNumberOfAssignedOrders,
    updateRawItemAlertQuantity,
    updateFinishedQuantity
}