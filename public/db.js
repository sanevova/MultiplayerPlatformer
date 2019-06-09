// Initialize Cloud Firestore through Firebase
firebase.initializeApp({
  apiKey: 'AIzaSyBMGc6QUmjR1E8w_q6LIIbG1oNqb37Gk3M',
  // authDomain: '### FIREBASE AUTH DOMAIN ###',
  projectId: 'yungskrylla'
});

var db = firebase.firestore();

console.log(db);


function readAll() {
    db.collection("jumps").get().then((querySnapshot) => {
        var max = 0;


        querySnapshot.forEach((doc) => {
            console.log('db callback');
            console.log(`${doc.id} => ${doc.data()}`);
            console.log(`${doc.id} => ${doc.data().count}`);
        });
    });
}

var getOptions = {
    source: 'server'
};

function read(name, callback) {
    console.log('read', name, callback);
    db.collection("jumps").doc(name).get(getOptions).then((doc) => {
        console.log(`${doc.id} => ${doc.data().count}`);
        if (callback) {
            callback(doc.id, doc.data().count);
        }
    }).catch(function(error) {
        console.log("Error getting data for ", name);
        callback(name, 0);
    });
}

function readMax(callback) {
    console.log('reading max');
    db.collection("jumps").orderBy("count", "desc").limit(1).get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            console.log(`db read max callback ${doc.id} => ${doc.data().count}`);
            callback(doc.id, doc.data().count);
        });
    });
}

function write(name, value) {
    console.log('write', name, value);
    db.collection("jumps").doc(name).set({
        count: value,
    });
}
