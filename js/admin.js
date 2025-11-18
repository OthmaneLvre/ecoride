/* FICHIER admin.js
Page admin.html */ 

// Chargement du DOM 
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("createEmployeeForm");
    const employeeTableBody = document.getElementById("employeeTableBody");
    const userTableBody = document.getElementById("userTableBody");
    const totalCreditsElement = document.getElementById("totalCredits");
    const roles = JSON.parse(localStorage.getItem("currentUserRoles"));

    if (!roles || !roles.includes("admin")) {
        globalThis.location.href = "login.html";
    }

    let ridesChart = null;
    let creditsChart = null;

    /* --- 1. Chargement des utilisateurs --- */
    async function loadUsers() {
        try {
            const response = await fetch("php/get_all_users.php");
            const data = await response.json();

            if (!data.success) {
                console.error("Erreur chargement utilisateurs :", data.error);
                return;
            }

            const users = data.users;
            displayUsers(users);
            displayEmployees(users);

        } catch (err) {
            console.error("Erreur fetch get_all_users.php :", err);
        }
    }

    // Affiche les utlisateurs (passagers / chauffeurs)
    function displayUsers(users) {
        if (!userTableBody) return;

        userTableBody.innerHTML = "";

        // On considère utilisateur = passager / chauffeur / les-deux
        const filtered = users.filter(u =>
            (u.roles && (
                u.roles.includes("passager") ||
                u.roles.includes("chauffeur") ||
                u.roles.includes("les-deux")
            ))
        );

        if (filtered.length === 0) {
            userTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Aucun utilisateur trouvé.</td></tr>`;
            return;
        }

        filtered.forEach(user => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td data-label="Nom">${user.nom} ${user.prenom}</td>
                <td data-label="Email">${user.email}</td>
                <td data-label="Rôle">${user.roles}</td>
                <td data-label="Statut">${user.statut}</td>
                <td data-label="Action">
                    <button class="toggle-user-btn" data-id="${user.id_utilisateur}">
                        ${user.statut === "actif" ? "Suspendre" : "Réactiver"}
                    </button>        
                </td>
            `;

            userTableBody.appendChild(row);
        });
    }

    // Affiche les employés (rôle employe)
    function displayEmployees(users) {
        if (!employeeTableBody) return;

        employeeTableBody.innerHTML = "";

        const employees = users.filter(u =>
            u.roles && u.roles.includes("employe")
        );

        if (employees.length === 0) {
            employeeTableBody.innerHTML = `<tr><td colspan="4" style="text-align:center;">Aucun employé trouvé.</td></tr>`;
            return;
        }

        employees.forEach(emp => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td data-label="Nom">${emp.nom} ${emp.prenom}</td>
                <td data-label="Email">${emp.email}</td>
                <td data-label="Statut">${emp.statut}</td>
                <td data-label="Action">
                    <button class="toggle-user-btn" data-id="${emp.id_utilisateur}">
                        ${emp.statut === "actif" ? "Suspendre" : "Réactiver"}
                    </button>        
                </td>
            `;

            employeeTableBody.appendChild(row);
        });
    }


    /* --- 2. SUSPENDRE / RÉACTIVER UN COMPTE --- */

    document.addEventListener("click", async (e) => {
        const btn = e.target.closest(".toggle-user-btn");
        if (!btn) return;

        const userId = btn.getAttribute("data-id");

        if (!userId) {
            console.error("ID utilisateur manquant");
            return;
        }

        try {
            const response = await fetch("php/suspend_user.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id_utilisateur: userId })
            });

            const data = await response.json();

            if (!data.success) {
                console.error("Erreur suspension :", data.error);
                return;
            }

            // On recharge la liste après mise à jour
            loadUsers();

        } catch (err) {
            console.error("Erreur fetch suspend_user.php :", err);
        }
    });

    /* --- 3. CRÉATION D'UN EMPLOYÉ --- */

    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const nomComplet = document.getElementById("empName").value.trim();
            const email = document.getElementById("empEmail").value.trim();
            const password = document.getElementById("empPassword").value.trim();

            if (!nomComplet || !email || !password) {
                alert("Merci de remplir tous les champs !");
                return;
            }

            // On sépare nom + prénom à partir du nom complet
            const parts = nomComplet.split(" ");
            const nom = parts.pop();              // dernier mot
            const prenom = parts.join(" ") || ""; // le reste

            try {
                const response = await fetch("php/create_employee.php", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ nom, prenom, email, password })
                });

                const data = await response.json();

                if (!data.success) {
                    alert("Erreur : " + data.error);
                    return;
                }

                alert("Employé créé avec succès !");
                form.reset();
                loadUsers(); // on recharge les tableaux

            } catch (err) {
                console.error("Erreur lors de la création employé :", err);
            }
        });
    }

    /* --- 4. STATISTIQUES : COVOITURAGES / JOUR --- */

    async function loadRidesStats() {
        try {
            const response = await fetch("php/get_stats_rides.php");
            const data = await response.json();

            if (!data.success) {
                console.error("Erreur stats rides :", data.error);
                return;
            }

            const labels = data.rides.map(r => r.jour);
            const values = data.rides.map(r => Number(r.total));

            buildRidesChart(labels, values);

        } catch (err) {
            console.error("Erreur fetch get_stats_rides.php :", err);
        }
    }

    function buildRidesChart(labels, values) {
        const ctx = document.getElementById("ridesChart");
        if (!ctx || typeof Chart === "undefined") return;

        if (ridesChart) {
            ridesChart.destroy();
        }

        ridesChart = new Chart(ctx, {
            type: "bar",
            data: {
                labels,
                datasets: [{
                    label: "Covoiturages par jour",
                    data: values,
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
    }

    /* --- 5. STATISTIQUES : CRÉDITS / JOUR --- */

    async function loadCreditsStats() {
        try {
            const response = await fetch("php/get_stats_credits.php");
            const data = await response.json();

            if (!data.success) {
                console.error("Erreur stats crédits :", data.error);
                return;
            }

            const labels = data.credits.map(c => c.jour);
            const values = data.credits.map(c => Number(c.total_credits));

            buildCreditsChart(labels, values);

        } catch (err) {
            console.error("Erreur fetch get_stats_credits.php :", err);
        }
    }

    function buildCreditsChart(labels, values) {
        const ctx = document.getElementById("creditsChart");
        if (!ctx || typeof Chart === "undefined") return;

        if (creditsChart) {
            creditsChart.destroy();
        }

        creditsChart = new Chart(ctx, {
            type: "line",
            data: {
                labels,
                datasets: [{
                    label: "Crédits gagnés par jour",
                    data: values,
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
    }

    /*--- 6. TOTAL DES CRÉDITS --- */

    async function loadTotalCredits() {
        try {
            const response = await fetch("php/get_total_credits.php");
            const data = await response.json();

            if (!data.success) {
                console.error("Erreur total crédits :", data.error);
                return;
            }

            const total = data.total_credits ?? 0;
            if (totalCreditsElement) {
                totalCreditsElement.textContent = `${total} crédits`;
            }

        } catch (err) {
            console.error("Erreur fetch get_total_credits.php :", err);
        }
    }

    /* --- 7. INITIALISATION GLOBALE --- */

    loadUsers();
    loadRidesStats();
    loadCreditsStats();
    loadTotalCredits();
});

document.addEventListener("click", (e) => {
    if (e.target.id === "adminLogoutBtn") {
        
        // suppression session localStorage
        localStorage.removeItem("currentUserId");
        localStorage.removeItem("currentUserName");
        localStorage.removeItem("currentUserRoles");

        // redirection vers la page de login
        globalThis.location.href = "login.html";
    }
});
