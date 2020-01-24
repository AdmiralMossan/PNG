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

function toDetails(){
    disabled = document.getElementById('picture').getAttribute('disabled');
    if(disabled === "disabled" || disabled === "") 
       return
    location.href =  "/Details.html";
}

async function fileUpload(file_data, reportData){
    var fileUrl = "";
    var timestamp = Number(new Date());
    if(isImage(file_data.name)){
        var storageRef = firebase.storage().ref("images/" + timestamp.toString() + file_data.name  );
    }else if(isVideo(file_data.name)){
        var storageRef = firebase.storage().ref("videos/" + timestamp.toString() + file_data.name  );
    }else if(isAudio(file_data.name)){
        var storageRef = firebase.storage().ref("audios/" + timestamp.toString() + file_data.name );
    }else{
        return "";
    }
    var task = storageRef.put(file_data);
    task.on('state_changed', function(snapshot){
        var progress = (snapshot.bytesTransferred/snapshot.totalBytes) * 100;
        console.log(progress);     
    }, function(error){
        console.log(error.message);
    }, function(){
        task.snapshot.ref.getDownloadURL().then(function(downloadURL){
            reportData.attachFile = downloadURL;
            sendReport(reportData);
        });
        
    });
   
    return fileUrl;
}
 
async function storeData(e, skip){
    e.preventDefault();
    category = sessionStorage.getItem("category");
    username = sessionStorage.getItem("username"); 
    group = sessionStorage.getItem("group"); 
    var dateInfo = "NA";
    var personInfo = "NA";
    var otherDetails = "";
    var attachFile =  "";
    var created = "";
    var reportData = {category, username,group,created,dateInfo,personInfo,otherDetails, attachFile}
    if(!skip){
        reportData.dateInfo = $("input[name='date']").is(':checked') ? $("input[name='date']:checked").val() : "NA";
        reportData.personInfo = $("input[name='person']").is(':checked') ? $("input[name='person']:checked").val() : "NA";
        reportData.otherDetails = $.trim($("#comment").val());
        if( $("#fileInput").val()!=""){
            file_data = $("#fileInput").prop("files")[0];
            fileUpload(file_data, reportData);
        }
    }else{
        sendReport(reportData);
    }
}

function sendReport(reportData){
    reportData.created = firebase.firestore.FieldValue.serverTimestamp();
    db.collection("reports").doc().set(reportData)
    .then(function() {
        console.log("Document successfully written!");
        sessionStorage.removeItem("category");
        $('#successModal').modal('show') 
    })
    .catch(function(error) {
        console.error("Error writing document: ", error);
    });
}

function getCategory(id){
    sessionStorage.setItem("category", id);
    buttonId = id
}


async function logIn(e){
    if(e==0){
        sessionStorage.setItem("username", "anonymous");
        sessionStorage.setItem("group", e);
        location.href =  "/Button.html";

    }else{
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
            sessionStorage.setItem("username", docs[0].username);
            sessionStorage.setItem("group", docs[0].group);
            sessionStorage.setItem("userType", docs[0].userType);
            location.href =  "/adminTest.html"; 
            // location.href =  "/admin.html";
        }else{
            sessionStorage.setItem("username", docs[0].username);
            sessionStorage.setItem("group", docs[0].group);
            sessionStorage.setItem("userType", docs[0].userType);
            location.href =  "/Button.html";
        }
        }else
        alert("Incorrect username or password")
    }
}

function logOut(){  
    location.href = "/Login.html";
    sessionStorage.clear();
}

async function addCategory(){
    let name = document.getElementById("catName").value;
    let desc = document.getElementById("catdesc").value;
    let size = 0;

    await db.collection("categories").get().then(function(querySnapshot) {
        size = querySnapshot.size;
    });

    db.collection("categories").doc().set({
        id: size, 
        name: name,
        description: desc
    })
    .then(function() {
        console.log("Document successfully written!");
        sessionStorage.removeItem("category");
        PNotify.success({
            title: "Successfully added Category",
            delay: 2000,
            modules: {
              Buttons: {
                closer: true,
                closerHover: true,
                sticker: false
              },
               Mobile: {
                swipeDismiss: true,
                styling: true
              }
            }
          });
          document.getElementById("catName").value = "";
          document.getElementById("catdesc").value = "";
    })
    .catch(function(error) {
        console.error("Error writing document: ", error);
    });
    
}
