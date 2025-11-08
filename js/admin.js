/* FICHIER admin.js
Page admin.html */ 


// Chargement du DOM 
document.addEventListener("DOMContentLoaded", () => {

    // Récupération ou initialisation des employés 
    const employees = JSON.parse(localStorage.getItem("employees")) || [];

    const form = document.getElementById("createEmployeeForm");
    const tableBody = document.getElementById("employeeTableBody");
    const totalCreditsElement = document.getElementById("totalCredits");

    /* ---- Création d'un employé ---- */ 
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const name = document.getElementById("empName").value.trim();
        const email = document.getElementById("empEmail").value.trim();
        const password = document.getElementById("empPassword").value.trim();

        if (!name || !email || !password) {
            alert ("Merci de remplir tous les champs !");
            return;
        }

        // Vérification si un employé existe déjà avec la même adresse mail 
        const alreadyExists = employees.some(emp => emp.email === email);
        if (alreadyExists) {
            alert("Un employé avec cet email existe déjà !");
            return;
        }

        const newEmployee = {
            id: Date.now(),
            name,
            email,
            password,
            role: "Employé",
            suspended: false
        };

        employees.push(newEmployee);
        localStorage.setItem("employees", JSON.stringify(employees));

        form.reset();
        displayEmployees();
    });

    /* ---- Affichage des employés ---- */ 

    function displayEmployees() {
        tableBody.innerHTML = "";

        if (employees.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center;">Aucun employé enregistré.</td></tr>`;
            return;
        }

        for (const emp of employees) {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td data-label="Nom">${emp.name}</td>
                <td data-label="Email">${emp.email}</td>
                <td data-label="Statut">${emp.suspended ? "Suspendu" : "Actif"}</td>
                <td data-label="Action">
                    <button class="toggle-btn" data-id="${emp.id}">
                        ${emp.suspended ? "Réactiver" : "Suspendre"}
                    </button>
                </td>    
            `;
            tableBody.appendChild(row);
        };    
    }


    /* SUSPENDRE / REACTIVER UN EMPLOYÉ */ 

    tableBody.addEventListener("click", (e) => {
        if (e.target.classList.contains("toggle-btn")) {
            const id = Number.parseInt(e.target.dataset.id);
            const emp = employees.find(e => e.id === id);

            if (emp) {
                emp.suspended = !emp.suspended;
                localStorage.setItem("employees", JSON.stringify(employees));
                displayEmployees();
            }
        }
    });


    /* --- Affichage des utilisateurs --- */ 
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const userTableBody = document.getElementById("userTableBody");

    function displayUsers() {
        userTableBody.innerHTML = "";

        if (users.length === 0) {
            userTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Aucun utilisateur enregistré.</td></tr>`;
            return;
        }

        for (const user of users) {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td data-label="Nom">${user.name}</td>
                <td data-label="Email">${user.email}</td>
                <td data-label="Rôle">${user.role}</td>
                <td data-label="Statut">${user.suspended ? "Suspendu" : "Actif"}</td>
                <td data-label="Action">
                    <button class="toggle-user-btn" data-id="${user.id}">
                        ${user.suspended ? "Réactiver" : "Suspendre"}
                    </button>
                </td>
            `;
            userTableBody.appendChild(row);
        };
    }


    /* Suspendre / réactiver un utilisateur */ 

    if (userTableBody) {
        userTableBody.addEventListener("click", (e) => {
            if (e.target.classList.contains("toggle-user-btn")) {
                const id = Number.parseInt(e.target.dataset.id);
                const user = users.find(u => u.id === id);

                if (user) {
                    user.suspended = !user.suspended;
                    localStorage.setItem("users", JSON.stringify(users));
                    displayUsers();
                }
            }
        });
    }    

    /* Initialisation */ 
    displayUsers();

    /* STATISTIQUES SIMULEES */

    // Simulation de covoiturages par jour 
    const ridesPerDay = {
        "01/11": 5,
        "02/11": 8,
        "03/11": 3,
        "04/11": 7,
        "05/11": 4,
    };

    // Simulation des crédits gagnés par jour 
    const creditsPerDay = {
        "01/11": 45,
        "02/11": 70,
        "03/11": 35, 
        "04/11": 65,
        "05/11": 40,
    };


    // Calcul du total de crédits 
    const totalCredits = Object.values(creditsPerDay).reduce((a, b) => a + b, 0);
    totalCreditsElement.textContent = `${totalCredits} crédits`;


    /* GRAPHIQUES (Chart.js) */ 

    // Vérification que Chart.js est bien chargé 
    if (typeof Chart == "undefined") {
        console.error("Chart.js n'est pas chargé !");
        return;
    }    
        
        // Graphique des covoiturages 
        // eslint-disable-next-line no-unused-vars
        const ridesChart = new Chart(document.getElementById("ridesChart"), {
            type: "bar",
            data: {
                labels: Object.keys(ridesPerDay),
                datasets: [{
                    label: "Covoiturages par jour",
                    data: Object.values(ridesPerDay),
                    backgroundColor: "rgba(46, 204, 113, 0.7)",
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });

        // Graphique des crédits gagnés 
        // eslint-disable-next-line no-unused-vars
        const creditsChart = new Chart(document.getElementById("creditsChart"), {
            type: "line",
            data: {
                labels: Object.keys(creditsPerDay),
                datasets: [{
                    label: "Crédits gagnés par jour",
                    data: Object.values(creditsPerDay),
                    borderColor: "rgba(52, 152, 219, 1)",
                    borderWidth: 2,
                    fill: false,
                    tension: 0.3,
                    pointBackgroundColor: "rgba(52, 152, 219, 1)"
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });

    // Premier affichage des employés existants 
    displayEmployees();
});