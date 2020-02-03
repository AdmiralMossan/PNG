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
      '<span>' + users[i].username + '</span>' +
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
  document.getElementById("messageBox").style.display = "block";
  document.getElementById("myForm").style.display = "none";
  document.getElementById("user_name").innerHTML = user.username;
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
  if (messageInputElement.value) {
    saveMessage(messageInputElement.value).then(function () {
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
  if (sessionStorage.getItem("userType") == 1) {
    admin = true;
    to = user.id;
    from = "admin";
  } else {
    admin = false;
    to = "admin";
    from = parseInt(sessionStorage.getItem("userId"), 10);
  }

  return firebase.firestore().collection('messages').add({
    to: to,
    text: messageText,
    from: from,
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    admin: admin,
  }).catch(function (error) {
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
        displayMessage(change.doc.id, message.timestamp, message.name,
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

// Template for messages.
var SENDER_MESSAGE_TEMPLATE = '<li class="pl-2 pr-2 bg-primary rounded text-white text-center send-msg mb-1">' +
  '<p class="messageDisplay"></p>' +
  '</li>';


var RECEIVER_MESSAGE_TEMPLATE =
  '<li class="p-1 rounded mb-1">' +
  '<div class="receive-msg">' +
  '<div class="nameDisplay"></div>' +
  // '<img src="http://nicesnippets.com/demo/image1.jpg">' +
  '<div class="receive-msg-desc text-center mt-1 ml-1 pl-2 pr-2">' +
  '<p class="messageDisplay pl-2 pr-2 rounded"></p>' +
  '</div>' +
  '</div>' +
  '</li>';

function createAndInsertMessage(id, timestamp, sender) {
  const container = document.createElement('div');
  container.innerHTML = sender ? SENDER_MESSAGE_TEMPLATE : RECEIVER_MESSAGE_TEMPLATE;
  const div = container.firstChild;
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

  if (!sender)
    div.querySelector('.nameDisplay').textContent = name;
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