var users = [];
var user = null;
function openForm(box) {
  if (box == 1) {
    document.getElementById("myForm").style.display = "block";
    initializeUsers();
  } else {
    document.getElementById("messageBox").style.display = "block";
    loadMessages();
  }
}

function searchUser() {
  // Declare variables
  var input, filter, ul, li, a, i, txtValue;
  input = document.getElementById('searchUser');
  filter = input.value.toUpperCase();
  ul = document.getElementById("users");
  li = ul.getElementsByTagName('li');

  // Loop through all list items, and hide those who don't match the search query
  for (i = 0; i < li.length; i++) {
    a = li[i].getElementsByTagName("span")[0];
    txtValue = a.textContent || a.innerText;
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      li[i].style.display = "";
    } else {
      li[i].style.display = "none";
    }
  }
}

function closeForm(box) {
  if (box == 1) {
    document.getElementById("myForm").style.display = "none";
    document.getElementById("messageBox").style.display = "none";
  } else {
    document.getElementById("messageBox").style.display = "none";
  }
}

async function getUsers() {
  await db.collection("users").where("userType", "==", 2).get().then(function (querySnapshot) {
    querySnapshot.forEach(function (doc) {
      users.push(doc.data());
    });
  });
}

async function initializeUsers() {
  if (users.length != 0) {
    return;
  }
  await getUsers();
  console.log(users.length);
  var usersDiv = document.getElementById("users");
  for (let i = 0; i < users.length; i++) {
    usersDiv.innerHTML += '<li id="user' + i + '" class="active my-0" onclick=initializeMessages(this)>' +
      '<div class="d-flex bd-highlight cursor-pointer">' +
      '<div class="img_cont">' +
      '<img src="https://cdn4.iconfinder.com/data/icons/ionicons/512/icon-ios7-contact-512.png" class="rounded-circle user_img">' +
      '</div>' +
      '<div class="user_info">' +
      '<span> User ' + users[i].id + '</span>' +
      '<p> Group: ' + users[i].group + '</p>' +
      '</div>' +
      '</div>' +
      '</li>' +
      '<hr class="mx-2 m-0">';
  }
}

function initializeMessages(e) {
  let index = parseInt(e.id.replace("user", ""), 10);
  user = users[index];
  document.getElementById("messagesList").innerHTML = "";
  document.getElementById("messageBox").style.display = "block";
  document.getElementById("myForm").style.display = "none";
  document.getElementById("user_name").innerHTML = "User " + user.id;
  document.getElementById("user_group").innerHTML = "Group: " + user.group;
  loadMessages();
}

function backToContacts() {
  document.getElementById("messageBox").style.display = "none";
  document.getElementById("myForm").style.display = "block";
}


//firebase chat

function toggleButton() {
  console.log("in");
  if (messageInputElement.value) {
    submitButtonElement.removeAttribute('disabled');
  } else {
    submitButtonElement.setAttribute('disabled', 'true');
  }
}

// Triggered when the send new message form is submitted.
function onMessageFormSubmit(e) {
  e.preventDefault();
  // Check that the user entered a message and is signed in.
  let message = messageInputElement.value;
  messageInputElement.value = "";
  if (message) {
    saveMessage(message).then(function () {
      // Clear message text field and re-enable the SEND button.
      resetMaterialTextfield();
      toggleButton();
    });
  }
}

// Saves a new message on the Cloud Firestore.
function saveMessage(messageText) {
    // Add a new message entry to the Firebase database.
    var to = -1;
    var admin = false;
    var from = -1;
    var sender = '';
    var receiver = ''
    if (sessionStorage.getItem("userType") == 1){
      admin = true;
      to = user.id;
      from = "admin";
      sender = "admin";
      receiver = user.username;
    }else{
        admin = false;
        to = "admin";
        from = parseInt(sessionStorage.getItem("userId"), 10);
        sender = sessionStorage.getItem("username");
        receiver = "admin";
    } 

    return firebase.firestore().collection('messages').add({
      to: to,
      text: messageText,
      from: from,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      admin: admin,
      sender: sender,
      receiver: receiver
    }).catch(function(error) {
      console.error('Error writing new message to Firebase Database', error);
    });
}

// Loads chat messages history and listens for upcoming ones.
function loadMessages() {
  // Create the query to load the last 12 messages and listen for new ones.
  var from = -1;
  var to = -1
  if (sessionStorage.getItem("userType") == 2) {
    from = "admin";
    to = parseInt(sessionStorage.getItem("userId"), 10);
  } else {
    from = user.id;
    to = "admin";
  }

  var query1 = firebase.firestore().collection('messages').where("to", "==", to)
    .where("from", "==", from).orderBy('timestamp', 'desc').limit(5);
  // Start listening to the query.
  query1.onSnapshot(function (snapshot) {
    snapshot.docChanges().forEach(function (change) {
      console.log('receiver');
      if (change.type === 'removed') {
        deleteMessage(change.doc.id);
      } else {
        var message = change.doc.data();
        displayMessage(change.doc.id, message.timestamp, message.text,
          message.text, false);
      }
    });
  });

  var query = firebase.firestore().collection('messages').where("to", "==", from)
    .where("from", "==", to).orderBy('timestamp', 'desc').limit(5);
  // Start listening to the query.
  query.onSnapshot(function (snapshot) {
    snapshot.docChanges().forEach(function (change) {
      if (change.type === 'removed') {
        deleteMessage(change.doc.id);
      } else {
        var message = change.doc.data();
        displayMessage(change.doc.id, message.timestamp, message.text,
          message.text, true);
      }
    });
  });
}

function deleteMessage(id) {
  var div = document.getElementById(id);
  // If an element for that message exists we delete it.
  if (div) {
    div.parentNode.removeChild(div);
  }
}

  var SENDER_MESSAGE_TEMPLATE = ' <div class="chat_msg_item chat_msg_item_user">' +
'<p class="messageDisplay rounded load">'+
'</p></div>';

  var RECEIVER_MESSAGE_TEMPLATE =
  '<span class="chat_msg_item chat_msg_item_admin  ">'+
  '<div class="chat_avatar">' +
     '<img src="https://cdn4.iconfinder.com/data/icons/ionicons/512/icon-ios7-contact-512.png"/>' +
  '</div><p class="messageDisplay rounded"></p></span>' ;

function createAndInsertMessage(id, timestamp, sender) {
  const container = document.createElement('div');
  container.innerHTML = sender ? SENDER_MESSAGE_TEMPLATE : RECEIVER_MESSAGE_TEMPLATE;
  console.log(container.innerHTML);
  console.log(container);
  const div = container.firstElementChild;;
  console.log(div);
  div.setAttribute('id', id);

  // If timestamp is null, assume we've gotten a brand new message.
  // https://stackoverflow.com/a/47781432/4816918
  timestamp = timestamp ? timestamp.toMillis() : Date.now();
  div.setAttribute('timestamp', timestamp);

  // figure out where to insert new message
  const existingMessages = messageListElement.children;
  if (existingMessages.length === 0) {
    messageListElement.appendChild(div);
  } else {
    let messageListNode = existingMessages[0];

    while (messageListNode) {
      const messageListNodeTime = messageListNode.getAttribute('timestamp');

      if (!messageListNodeTime) {
        throw new Error(
          `Child ${messageListNode.id} has no 'timestamp' attribute`
        );
      }

      if (messageListNodeTime > timestamp) {
        break;
      }

      messageListNode = messageListNode.nextSibling;
    }

    messageListElement.insertBefore(div, messageListNode);
  }

  return div;
}

function displayMessage(id, timestamp, name, text, sender) {
  var div = document.getElementById(id) || createAndInsertMessage(id, timestamp, sender);

  // if (!sender)
  //   div.querySelector('.nameDisplay').textContent = name;
  var messageElement = div.querySelector('.messageDisplay');

  if (text) { // If the message is text.
    messageElement.textContent = text;
    // Replace all line breaks by <br>.
    messageElement.innerHTML = messageElement.innerHTML.replace(/\n/g, '<br>');
  }
  // Show the card fading-in and scroll to view the new message.
  setTimeout(function () { div.classList.add('visible') }, 1);
  messageListElement.scrollTop = messageListElement.scrollHeight;
  messageInputElement.focus();
}

// Resets the given MaterialTextField.
function resetMaterialTextfield() {
  document.getElementById('messageInput').value = "";
}



var messageListElement = document.getElementById('messagesList');
var messageFormElement = document.getElementById('message-form');
var messageInputElement = document.getElementById('messageInput');
var submitButtonElement = document.getElementById('submitMessage');


messageFormElement.addEventListener('submit', onMessageFormSubmit);
// Toggle for the button.
messageInputElement.addEventListener('keyup', toggleButton);
messageInputElement.addEventListener('change', toggleButton);