// Initialize Firebase
let config = {
    apiKey: "AIzaSyDEtbinbscaxVKpa6GAyrOxh9moQsXO9-U",
    authDomain: "myfirstfirebaseproject-7cd16.firebaseapp.com",
    databaseURL: "https://myfirstfirebaseproject-7cd16.firebaseio.com",
    projectId: "myfirstfirebaseproject-7cd16",
    storageBucket: "myfirstfirebaseproject-7cd16.appspot.com",
    messagingSenderId: "970304867141",
    appId: "1:970304867141:web:e8d354070d615e91504c2c",
}; 

firebase.initializeApp(config);
let db = firebase.firestore();
console.log("Cloud Firestores Loaded");
let buttonId = -1

var buttons = document.getElementsByTagName("button");
var buttonsCount = buttons.length;
// Enable offline capabilities
firebase.firestore().enablePersistence()
    .then(function() {
        // Initialize Cloud Firestore through firebase
        var db = firebase.firestore();
    })
    .catch(function(err) {
        if (err.code == 'failed-precondition') {
            // Multiple tabs open, persistence can only be enabled in one tab at a a time.

        } else if (err.code == 'unimplemented') {
            // The current browser does not support all of the
            // features required to enable persistence
            // ...
        }
    });


function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}
 
function storeData(){
    disabled = document.getElementById('picture').getAttribute('disabled');
    if(disabled === "disabled" || disabled === "") 
       return
    category = buttonId;
    username = sessionStorage.getItem("username"); ;
    group = sessionStorage.getItem("group"); ;
    db.collection("reports").doc().set({
        category: category,
        username: username,
        group: group,
        created: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(function() {
        console.log("Document successfully written!");
    })
    .catch(function(error) {
        console.error("Error writing document: ", error);
    });
}

function getCategory(id){
    buttonId = id
}


async function logIn(e){
    e.preventDefault();
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    docs = []
    await db.collection("users").where( "username" , "==" , username ).where( "password" , "==" , password ).get().then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            docs.push(doc.data());
            console.log(doc.id, " => ", doc.data());
        });
    });
    if(docs.length == 1){
       if(docs[0].userType == 1){
          location.href = "/admin.html";
       }else{
          location.href = "/Button.html";
          sessionStorage.setItem("username", docs[0].username);
          sessionStorage.setItem("group", docs[0].group);
       }
    }else
       alert("Incorrect username or password")
    
}

function logOut(){  
    location.href = "/Login.html";
    sessionStorage.clear();
}
