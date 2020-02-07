var newUserTable
var locGrps = []
class User {
    constructor(name, group) {
        this.name = name;
        this.group = group;
        this.password = generatePassword();
        this.type = 2;
    }
}

window.addEventListener("load", async () => {
    isloaded = true;
    newUserTable = $('#addUsersTable').DataTable({
        paging: false,
        info: false,
        sorting: false,
        searching: false,
        language: {
            emptyTable: addUserElement()
        },

    });
    showUsers().then(() => {
        $('#usersTable').DataTable({
            dom: 'Bfrtip',
            scrollY: '40vh',
            buttons: ['csv', 'excel', 'pdf'],
            responsive: true
        });
    })

    await db
        .collection("groups")
        .orderBy("id")
        .get()
        .then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
                locGrps.push(doc.data().name);
            });
        });


    $('#userModalButton').click(() => {
        addusers()
    })
    $('#addNewUser').click(() => {
        $('#newUserDetails').remove()
        $('#addUsersTable').parent().append(addUserElement(1))

    })
});

async function addusers() {
    let users = []
    let userDetails = newUserTable.cells().data()
    for (let i = 0; i < userDetails.length; i += 2) {
        users.push(new User(userDetails[i], userDetails[i + 1]))
    }
    console.log(users)
    users.forEach(async (user) => {
        let size
        await db.collection("ids").get().then(function (querySnapshot) {
            size = querySnapshot.docs[0].data().userId + 1;
            querySnapshot.forEach(function (doc) {
                let newID = doc.data().userId + 1
                db.collection("ids").doc(doc.id).update({
                    userId: newID
                });
            });
        })
        console.log(size)
        console.log(user)
        db.collection("users").doc().set({
            id: size,
            dateCreated: firebase.firestore.FieldValue.serverTimestamp(),
            username: user.name,
            group: user.group,
            userType: user.type,
            password: user.password
        })


    })
        .then(async function () {
            console.log("Document successfully written!");
            sessionStorage.removeItem("category");

            PNotify.success({
                title: "Successfully added User/s",
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

            showUsers().then(() => {
                $('#usersTable').DataTable({
                    dom: 'Bfrtip',
                    scrollY: '40vh',
                    buttons: ['csv', 'excel', 'pdf'],
                    responsive: true
                });
            });
            $('#userModal').modal('hide')

        })
        .catch(function (error) {
            console.error("Error adding user/s: ", error);
        });
}

function newUser() {
    newUserTable.row.add([$('#userName').val(), $('#userGroup').val()]).draw();
    $('#userModalButton').removeClass('disabled')
    $('#userName').val("")
    $('#userGroup').val("")
}

function addUserElement(bol) {
    if (bol === undefined) {
        return '<div class="text-center" id="newUserDetails"><button class="material-icons rounded-circle text-success border-0 " data-toggle="tooltip" data-placement="top" title="new user" id="addNewUser">add</button></div > '
    } else {
        return '<div class="text-center pt-2" id="newUserDetails">' +
            '<input type="text" placeholder="username" id="userName"></input>' +
            '<input type="text" placeholder="group" id="userGroup"></input>' +
            '<button class="material-icons rounded-circle text-success border-0 align-middle ml-2" data-toggle="tooltip" data-placement="top" title="new user" id="addNewUser" onclick=newUser()>add</button></div > '
    }
}

async function showUsers() {
    let tempUsers = [];

    await db
        .collection("users")
        .where("userType", "==", 2)
        .orderBy("id")
        .get()
        .then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
                tempUsers.push(doc.data());
            });
        });

    $('#showUsersTable div').html("");

    //Add body
    let head =
        "<table id='usersTable' class='display'>" +
        "<thead class='thead-inverse bg-custom text-custom'>" +
        "<tr>" +
        "<th style='width:20%;'>User ID</th>" +
        "<th style='width:70%;'>Username</th>" +
        "<th style='width:5%;'>Group</th>" +
        "<th style='width:5%;'>Actions</th>" +
        "</tr>" +
        "</thead>";

    let body = '<tbody class="scroll-secondary">';

    tempUsers.forEach(function (user) {
        body +=
            "<tr>" +
            "<td>" +
            user.id +
            "</td>" +
            "<td>" +
            user.username +
            "</td>" +
            "<td style='line-height: 1em;'>" +
            user.group +
            "</td>" +
            "<td class='d-flex'>" +
            "<div class='p-1 m-1 cursor-pointer'><a href='#' data-toggle='modal' data-target='#updateUserModal' class='cursor-pointer' title='Edit' id='editUser'" + user.id + " onclick='$(\"#userID\").text(`User ID: " + user.id + "`); $(\"#userName\").text(`Username: " + user.username + "`); $(\"#userGroup\").val(`" + user.group + "`); $(\"#userModalButton\").attr(\"onclick\", \"updateUser(" + user.id + ")\");'><i class='fas fa-edit'></i></a></div>" +
            "<div class='p-1 m-1 cursor-pointer'><a href='#' class='cursor-pointer' title='Delete' id='deleteUser'" + user.id + " onClick='removeUser(" + user.id + ")'><i class='fas fa-trash-alt'></i></a></div>" +
            "</td>" +
            "</tr>";
    });

    $("#showUsersTable").append(head + body + "</tbody></table>");
}

async function updateUser(value) {

    let newGroup = document.getElementById("userGroup").value;

    if (newGroup == "")
        return

    if (locGrps.includes(newGroup)) {
        db.collection("users")
            .where("id", "==", value)
            .get()
            .then(function (querySnapshot) {
                querySnapshot.forEach(function (doc) {
                    doc.ref.update({
                        group: newGroup
                    });
                });

                PNotify.success({
                    title: "Update Successful!",
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

                showUsers().then(() => {
                    $('#usersTable').DataTable({
                        dom: 'Bfrtip',
                        scrollY: '40vh',
                        buttons: ['csv', 'excel', 'pdf'],
                        responsive: true
                    });
                });
                document.getElementById("userGroup").value = "";

            })
            .catch(function (error) {
                console.error("Error User update: ", error);
            });

        $('#userModal').modal('hide');
    } else {
        PNotify.error({
            title: "Update Error!",
            text: "Group does not exist!",
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
        return
    }
}

async function removeUser(value) {
    const notice = PNotify.notice({
        title: "Delete User",
        text: "Confirm Delete?",
        icon: "fas fa-question-circle",
        hide: false,
        modules: {
            Confirm: {
                confirm: true,
            },
            Buttons: {
                closer: true,
                closerHover: true,
                sticker: false
            },
            Desktop: {
                desktop: true,
                fallback: true,
                icon: null
            },
            Mobile: {
                swipeDismiss: true,
                styling: true
            }
        }
    });

    notice.on('pnotify.confirm', () => {
        db.collection("users")
            .where("id", "==", value)
            .get()
            .then(function (querySnapshot) {
                querySnapshot.forEach(function (doc) {
                    doc.ref.delete();
                });

                PNotify.success({
                    title: "Delete Successful!",
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

                showUsers().then(() => {
                    $('#usersTable').DataTable({
                        dom: 'Bfrtip',
                        scrollY: '40vh',
                        buttons: ['csv', 'excel', 'pdf'],
                        responsive: true
                    });
                });
            })
            .catch(function (error) {
                console.error("Error user deletion: ", error);
            });
    });
}

function duplicateHandling() {

}

function userGroupSearch() {
    $('#userGroup').autocomplete({
        source: locGrps,
        minLength: 0
    }).focus(function () {
        $(this).autocomplete("search");
    });
}