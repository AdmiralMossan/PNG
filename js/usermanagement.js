window.addEventListener("load", async () => {
    isloaded = true;
    await showUsers();
    
    $('#usersTable').DataTable({
        dom: 'Bfrtip',
        scrollY: '40vh',
        buttons: ['csv', 'excel', 'pdf'],
        responsive: true
    });
    
    showUsers().then(() => {
        $('#usersTable').DataTable({
            dom: 'Bfrtip',
            scrollY: '40vh',
            buttons: ['csv', 'excel', 'pdf'],
            responsive: true
        });
    });
});

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
        "<th style='width:25%;'>User ID</th>" +
        "<th style='width:70%;'>Username</th>" +
        "<th style='width:5%;'>Group</th>" +
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
            // "<td class='d-flex'>" +
            // "<div class='p-1 m-1 cursor-pointer'><a href='#' data-toggle='modal' data-target='#userModal' class='cursor-pointer' title='Edit' id='editUser'" + user.id + " onclick='$(\"#userModalTitle, #userModalh3, #userModalButton\").text(\"Update User\");'><i class='fas fa-edit'></i></a></div>" +
            // "<div class='p-1 m-1 cursor-pointer'><a href='#' class='cursor-pointer' title='Delete' id='deleteUser'" + user.id + " onClick='removeUser(" + user.id + ")'><i class='fas fa-trash-alt'></i></a></div>" +
            // "</td>" +
            "</tr>";
    });

    $("#showUsersTable").append(head + body + "</tbody></table>");
}

async function addUser() {

    // let name = document.getElementById("catName").value;
    // let desc = document.getElementById("catDesc").value;

    // if (name == "" || desc == "")
    //     return
    
    let size = 0;

    // await db.collection("ids").get().then(function (querySnapshot) {
    //     size = querySnapshot.docs[0].data().categoryID + 1;
    //     querySnapshot.forEach(function (doc) {
    //         let newID = doc.data().categoryID + 1
    //         db.collection("ids").doc(doc.id).update({
    //             categoryID: newID
    //         });
    //     });
    // });

    // db.collection("categories").doc().set({
    //     id: size,
    //     name: name,
    //     description: desc
    // })
    //     .then(async function () {
    //         console.log("Document successfully written!");
    //         sessionStorage.removeItem("category");

    //         PNotify.success({
    //             title: "Successfully added Category",
    //             delay: 2000,
    //             modules: {
    //                 Buttons: {
    //                     closer: true,
    //                     closerHover: true,
    //                     sticker: false
    //                 },
    //                 Mobile: {
    //                     swipeDismiss: true,
    //                     styling: true
    //                 }
    //             }
    //         });

    //         showCategories().then(() => {
    //             $('#categoriesTable').DataTable({
    //                 dom: 'Bfrtip',
    //                 scrollY: '40vh',
    //                 buttons: ['csv', 'excel', 'pdf'],
    //                 responsive: true
    //             });
    //         });
    //         document.getElementById("catName").value = "";
    //         document.getElementById("catDesc").value = "";

    //     })
    //     .catch(function (error) {
    //         console.error("Error writing document: ", error);
    //     });

    // $('#userModal').modal('hide');
}

async function updateUser(value) {

    // let newName = document.getElementById("catName").value;
    // let newDesc = document.getElementById("catDesc").value;

    // if (newName == "" || newDesc == "")
    //     return

    // db.collection("categories")
    //     .where("id", "==", value)
    //     .get()
    //     .then(function (querySnapshot) {
    //         querySnapshot.forEach(function (doc) {
    //             doc.ref.update({
    //                 name: newName,
    //                 description: newDesc
    //             });
    //         });

    //         PNotify.success({
    //             title: "Update Successful!",
    //             delay: 2000,
    //             modules: {
    //                 Buttons: {
    //                     closer: true,
    //                     closerHover: true,
    //                     sticker: false
    //                 },
    //                 Mobile: {
    //                     swipeDismiss: true,
    //                     styling: true
    //                 }
    //             }
    //         });

    //         showCategories().then(() => {
    //             $('#categoriesTable').DataTable({
    //                 dom: 'Bfrtip',
    //                 scrollY: '40vh',
    //                 buttons: ['csv', 'excel', 'pdf'],
    //                 responsive: true
    //             });
    //         });
    //         document.getElementById("catName").value = "";
    //         document.getElementById("catDesc").value = "";

    //     })
    //     .catch(function (error) {
    //         console.error("Error category deletion: ", error);
    //     });

    // $('#categoryModal').modal('hide');
}

async function removeUser(value) {
    // const notice = PNotify.notice({
    //     title: "Delete Category",
    //     text: "Confirm Delete?",
    //     icon: "fas fa-question-circle",
    //     hide: false,
    //     modules: {
    //         Confirm: {
    //             confirm: true,
    //         },
    //         Buttons: {
    //             closer: true,
    //             closerHover: true,
    //             sticker: false
    //         },
    //         Desktop: {
    //             desktop: true,
    //             fallback: true,
    //             icon: null
    //         },
    //         Mobile: {
    //             swipeDismiss: true,
    //             styling: true
    //         }
    //     }
    // });

    // notice.on('pnotify.confirm', () => {
    //     db.collection("categories")
    //         .where("id", "==", value)
    //         .get()
    //         .then(function (querySnapshot) {
    //             querySnapshot.forEach(function (doc) {
    //                 doc.ref.delete();
    //             });

    //             PNotify.success({
    //                 title: "Delete Successful!",
    //                 delay: 2000,
    //                 modules: {
    //                     Buttons: {
    //                         closer: true,
    //                         closerHover: true,
    //                         sticker: false
    //                     },
    //                     Mobile: {
    //                         swipeDismiss: true,
    //                         styling: true
    //                     }
    //                 }
    //             });

    //             showCategories().then(() => {
    //                 $('#categoriesTable').DataTable({
    //                     dom: 'Bfrtip',
    //                     scrollY: '40vh',
    //                     buttons: ['csv', 'excel', 'pdf'],
    //                     responsive: true
    //                 });
    //             });
    //         })
    //         .catch(function (error) {
    //             console.error("Error category deletion: ", error);
    //         });
    // });

}