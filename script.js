const grid = document.getElementById('grid');
const loader = document.getElementById('loader');
const countryFilter = document.getElementById('countryFilter');
const sortSelect = document.getElementById("sortSelect");

let users = [];
let pinnedUsers = JSON.parse(localStorage.getItem("pinnedUsers")) || [];

let currentGender = "";
let currentCountry = "";

const countryMap = {
    "United States": "us",
    "United Kingdom": "gb",
    "Canada": "ca",
    "Australia": "au",
    "Germany": "de",
    "France": "fr",
    "Spain": "es",
    "Switzerland": "ch",
    "Netherlands": "nl",
    "Denmark": "dk",
    "Finland": "fi",
    "Norway": "no",
    "Ireland": "ie",
    "Turkey": "tr",
    "Iran": "ir",
    "Ukraine": "ua",
    "Serbia": "rs",
    "New Zealand": "nz",
    "Brazil": "br",
    "Mexico": "mx",
    "India": "in"
};

async function fetchUsers() {

    loader.classList.remove("hidden");

    try {

        let count = document.getElementById("userCount").value || 10;

        document.querySelector(".info-row b").innerText =
            `${count} Random Users`;

        let url = `https://randomuser.me/api/?results=${count}&noinfo`;

        if (currentCountry) {
            url += `&nat=${countryMap[currentCountry]}`;
        }

        if (currentGender) {
            url += `&gender=${currentGender}`;
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error("API failed");

        const data = await res.json();

        let unique = [];
        let emails = new Set();

        data.results.forEach(u => {
            if (!emails.has(u.email)) {
                emails.add(u.email);
                unique.push(u);
            }
        });

        users = unique;
        render(users);

    } catch (err) {

        grid.innerHTML =
            `<p style="color:red;text-align:center;">
                Failed to load users ❌
             </p>`;
    }

    loader.classList.add("hidden");
}

countryFilter.innerHTML =
    `<option value="">🌍 All Countries</option>`;

Object.keys(countryMap).forEach(country => {
    countryFilter.innerHTML +=
        `<option value="${country}">
            ${country}
        </option>`;
});

function sortUsers(data) {

    const value = sortSelect.value;

    if (value === "az") {
        return [...data].sort(
            (a, b) => a.name.first.localeCompare(b.name.first)
        );
    }

    if (value === "za") {
        return [...data].sort(
            (a, b) => b.name.first.localeCompare(a.name.first)
        );
    }

    return data;
}

function getCountryDesign(country) {

    const designs = {
        "France": "linear-gradient(135deg,#ff7eb3,#9333ea)",
        "Japan": "linear-gradient(135deg,#ff4d4d,#990000)",
        "Philippines": "linear-gradient(135deg,#3b82f6,#facc15)",
        "United States": "linear-gradient(135deg,#3b82f6,#1e3a8a)",
        "default": "linear-gradient(135deg,#6d5cff,#b65cff)"
    };

    return designs[country] || designs.default;
}

function render(data) {

    grid.innerHTML = "";

    const sorted = sortUsers(data);

    sorted.forEach(u => {

        let card = document.createElement("div");
        card.className = "card";

        card.style.background =
            getCountryDesign(u.location.country);

        card.innerHTML = `

<div class="card-front">

    <button class="star">
        ${pinnedUsers.some(p => p.email === u.email) ? "★" : "☆"}
    </button>

    <div class="avatar">
        <img src="${u.picture.large}">
    </div>

    <h3>${u.name.first} ${u.name.last}</h3>
    <p>${u.email}</p>

    <div class="country">
        <img src="https://flagcdn.com/w20/${u.nat.toLowerCase()}.png">
        ${u.location.country}
    </div>

</div>

<div class="card-back">
    <h3>${u.name.first}</h3>
    <p>📞 ${u.phone}</p>
    <p>📍 ${u.location.street.number} ${u.location.street.name}, ${u.location.city}</p>
    <p>🌍 ${u.location.country}</p>
    <p>🎂 Age: ${u.dob.age}</p>
</div>
`;

        card.onclick = () =>
            card.classList.toggle("flip");

        card.querySelector(".star").onclick = (e) => {

            e.stopPropagation();

            const exists =
                pinnedUsers.find(p => p.email === u.email);

            if (exists) {
                pinnedUsers =
                    pinnedUsers.filter(p => p.email !== u.email);
            } else {
                pinnedUsers.push(u);
            }

            localStorage.setItem(
                "pinnedUsers",
                JSON.stringify(pinnedUsers)
            );

            render(users);
        };

        grid.appendChild(card);
    });
}

countryFilter.onchange = () => {
    currentCountry = countryFilter.value;
    fetchUsers();
};

sortSelect.onchange = () => render(users);

document.getElementById('generateBtn').onclick =
    () => fetchUsers();

document.getElementById('allBtn').onclick = () => {
    currentGender = "";
    fetchUsers();
};

document.getElementById('maleBtn').onclick = () => {
    currentGender = "male";
    fetchUsers();
};

document.getElementById('femaleBtn').onclick = () => {
    currentGender = "female";
    fetchUsers();
};

document.getElementById('pinnedBtn').onclick = () => {
    render(pinnedUsers);
};

fetchUsers();
