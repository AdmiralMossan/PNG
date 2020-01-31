var users = [];
function openForm() {
    document.getElementById("myForm").style.display = "block";
    initializeUsers();
}
  
function closeForm() {
    document.getElementById("myForm").style.display = "none";
}

async function getUsers(){
    await db.collection("users").where("userType", "==", 2).get().then(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
            users.push(doc.data());
        });
    });
}

async function initializeUsers(){
    if(users.length!=0){
        return;
    }
    await getUsers();
    console.log(users.length); 
    var usersDiv = document.getElementById("users");
    for(let i=0; i<users.length; i++){
        usersDiv.innerHTML += '<li id="user' +  i + '" class="active" onclick=initializeMessages(this)>' +
            '<div class="d-flex bd-highlight">' +
            '<div class="img_cont">' +
                '<img src="https://cdn4.iconfinder.com/data/icons/ionicons/512/icon-ios7-contact-512.png" class="rounded-circle user_img">' +
            '</div>' +
            '<div class="user_info">' +
                '<span>'+ users[i].username + '</span>' +
                '<p> Group: '+  users[i].group + '</p>' +
            '</div>' +
            '</div>' +
        '</li>';
    }
}

function initializeMessages(e){
   let index =  parseInt(e.id.replace("user", ""), 10);
   let user =  users[index];
   document.getElementById("messageBox").style.display = "block";
   document.getElementById("myForm").style.display = "none";
   document.getElementById("user_name").innerHTML = user.username; 
   document.getElementById("user_group").innerHTML =  user.group;
}

function backToContacts(){

}

