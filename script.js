let list = [];

window.addEventListener("load", function (event) {
    console.log("Toutes les ressources sont chargées !");
    if (window.XMLHttpRequest) { // Mozilla, Safari, IE7+...
        httpRequest = new XMLHttpRequest();
        
    }
    else if (window.ActiveXObject) { // IE 6 et antérieurs
        httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
       
    }
    if (!httpRequest) {
        alert('Abandon :( Impossible de créer une instance de XMLHTTP');
        return false;
    }
    else {
        
        getAll();
        //auto refresh 15000 ms
        this.setInterval(() => {
            getAll();
            console.log("oui")
        }, 15000);
    }
});

function getAll() {


    httpRequest.onreadystatechange = getAllReceived;
    // false = asynchrone, ne fait rien tant que pas de réponse
    httpRequest.open('GET', 'http://localhost:9090/api/taches', false);
    httpRequest.send();
}

function getAllReceived() {
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
        if (httpRequest.status === 200) {
            //JSON.parse() transforme le text en objet
            list = JSON.parse(httpRequest.responseText);
            //remet à 0 les listes affiché
            document.getElementById("all-tasks").innerHTML = ''
            document.getElementById("all-tasks-done").innerHTML = ''

            //boucle sur toute les task reçu
            list.forEach(element => {
                //création d'un nouveau bloque
                const bloque = document.createElement("div");
                //ternaire pour avoir le bon css
                bloque.id = element.terminee ? "bloque-done" : "bloque";

                //ajout du text
                const text = document.createElement("label");
                const date = document.createElement("label");
                text.innerText = element.description;
                date.innerText = element.date;
                bloque.appendChild(text)
                bloque.appendChild(date)
                
                if (!element.terminee) {
                    
                    const editBtn = document.createElement("button");
                    editBtn.innerText = "Modifier"
                    editBtn.setAttribute("type", "button")
                    // editBtn.setAttribute("class", "btn btn-primary")
                    editBtn.setAttribute("data-toggle", "modal")
                    editBtn.setAttribute("data-target", "#editModal")
                    editBtn.setAttribute("data-description", element.description)
                    editBtn.setAttribute("data-date", element.date)
                    editBtn.setAttribute("data-id", element.id)
                    editBtn.setAttribute("data-terminee", element.terminee)
                    bloque.appendChild(editBtn)

                    const doneBtn = document.createElement("button");
                    doneBtn.setAttribute('onclick', 'doneTask("' + element.id + '")');

                    doneBtn.innerText = "Terminer"
                    doneBtn.setAttribute("class", "doneBtn");
                    bloque.appendChild(doneBtn)

                    
                }
                const deleteBtn = document.createElement("button");
                deleteBtn.setAttribute('onclick', 'deleteTask("' + element.id + '")');
                
                deleteBtn.innerText = "Supprimer"
                deleteBtn.setAttribute("class", "deleteBtn");
                bloque.appendChild(deleteBtn)
                


                //placement du bloque au bon endroit
                document.getElementById(element.terminee ? "all-tasks-done" : "all-tasks").appendChild(bloque);
            });
        } else {
            alert('Il y a eu un problème avec la requête.');
        }
    }
}

function deleteTask(id) {

    httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = handleAction;
    // false = asynchrone, ne fait rien tant que pas de réponse
    httpRequest.open('DELETE', `http://localhost:9090/api/taches/${id}`, false);
    httpRequest.send();
}

function doneTask(id) {

    httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = handleAction;
    // false = asynchrone, ne fait rien tant que pas de réponse
    httpRequest.open('PUT', `http://localhost:9090/api/taches/${id}/terminer`, false);
    httpRequest.send();
}

function handleAction() {
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
        if (httpRequest.status === 200) {
            getAll();
        } else {
            alert('Il y a eu un problème avec la requête.');
        }
    }
}

function addForms() {
    //récupère le formulaire garce à son id
    const addForm = document.forms.namedItem("addForm")

    //récupère les VALEURS des input
    formData = new FormData(addForm);

    //créer un JSON/Objet
    const form = {
        description: "",
        date: "",
        terminee: false
    }

    for (let p of formData) {
        console.log(p)
        //Check si valeur vide
        if (p[1] == "")
        {
            alert(`Veuillez donner ${p[0] == "description" ? "un titre": "une date"} à votre tâche`);
            return;
        }
        else {
            if (p[0] == "description")
                form.description = p[1];
            else
                form.date = p[1];
        }
    }

    httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = handleAction;

    httpRequest.open('POST', `http://localhost:9090/api/taches/`, false);

    httpRequest.setRequestHeader('Content-type', 'application/json');
    
    //stringify transforme l'objet en string bien formatté
    //send(x) passe x dans le body de la requete
    httpRequest.send(JSON.stringify(form));
}

function editForms() {
    //récupère le formulaire garce à son id
    const editForm = document.forms.namedItem("editForm")

    //récupère les VALEURS des input
    formData = new FormData(editForm);

    //créer un JSON/Objet
    const form = {
        id: "",
        description: "",
        date: "",
        terminee: false
    }

    for (let p of formData) {
        console.log(p)
        //Check si valeur vide
        if (p[1] == "") {
            alert(`Veuillez donner ${p[0] == "description" ? "un titre" : "une date"} à votre tâche`);
            return;
        }
        else {
            if (p[0] == "description")
                form.description = p[1];
            else if (p[0] == "id")
                form.id = p[1];
            else if (p[0] == "terminee")
                form.terminee = p[1];
            else
                form.date = p[1];
        }
    }

    console.log(form)
    httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = handleAction;

    httpRequest.open('PUT', `http://localhost:9090/api/taches/${form.id}`, false);

    httpRequest.setRequestHeader('Content-type', 'application/json');

    //stringify transforme l'objet en string bien formatté
    //send(x) passe x dans le body de la requete
    httpRequest.send(JSON.stringify(form));
}



$('#editModal').on('show.bs.modal', function (event) {
    let button = $(event.relatedTarget) // Button that triggered the modal
    let title = button.data('description') // Extract info from data-* attributes
    let id = button.data('id')
    let terminee = button.data('terminee')
    let date = button.data('date')
    // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
    // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
    let modal = $(this)
    modal.find('.modal-body #description').val(title)
    modal.find('.modal-body #date').val(date)
    modal.find('.modal-body #id').val(id)
    modal.find('.modal-body #terminee').val(terminee)
})