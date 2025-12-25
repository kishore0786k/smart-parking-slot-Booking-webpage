const TOTAL_SLOTS = 8;
const STORAGE_KEY = "parkingSlots";
const ACTIVITY_KEY = "parkingActivity";

/* DOM */
const parkingContainer = document.getElementById("parking");
const bookingFormContainer = document.getElementById("booking-form-container");
const bookingForm = document.getElementById("booking-form");
const slotNumberInput = document.getElementById("slotNumber");
const userNameInput = document.getElementById("userName");
const vehicleNumberInput = document.getElementById("vehicleNumber");
const confirmationDiv = document.getElementById("confirmation");
const adminTableBody = document.getElementById("admin-table-body");
const activityLogBody = document.getElementById("activity-log");

/* STORAGE */
function initializeSlots() {
    if (!localStorage.getItem(STORAGE_KEY)) {
        const slots = [];
        for (let i = 1; i <= TOTAL_SLOTS; i++) {
            slots.push({ id: i, booked: false, user: null, vehicle: null });
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(slots));
    }
}

function getSlots() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY));
}

function saveSlots(slots) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slots));
}

/* RENDER PARKING */
function renderSlots() {
    const slots = getSlots();
    parkingContainer.innerHTML = "";

    slots.forEach(slot => {
        const div = document.createElement("div");
        div.className = `slot ${slot.booked ? "booked" : "available"}`;
        div.textContent = `Slot ${slot.id}`;

        if (!slot.booked) {
            div.onclick = () => {
                bookingFormContainer.style.display = "flex";
                slotNumberInput.value = slot.id;
            };
        } else {
            div.style.pointerEvents = "none";
        }

        parkingContainer.appendChild(div);
    });
}

/* ADMIN PANEL */
function renderAdminPanel() {
    const slots = getSlots();
    adminTableBody.innerHTML = "";

    slots.forEach(slot => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${slot.id}</td>
            <td>${slot.booked ? "Booked" : "Available"}</td>
            <td>${slot.user ?? "-"}</td>
            <td>${slot.vehicle ?? "-"}</td>
            <td>
                ${slot.booked ? `<button class="cancel-btn" onclick="cancelBooking(${slot.id})">Cancel</button>` : "-"}
            </td>
        `;
        adminTableBody.appendChild(row);
    });
}

/* ANALYTICS */
function updateAnalytics() {
    const slots = getSlots();
    const total = slots.length;
    const booked = slots.filter(s => s.booked).length;

    document.getElementById("total-slots").textContent = total;
    document.getElementById("booked-slots").textContent = booked;
    document.getElementById("available-slots").textContent = total - booked;
}

/* ACTIVITY LOG */
function logActivity(action, slot) {
    const logs = JSON.parse(localStorage.getItem(ACTIVITY_KEY)) || [];
    logs.unshift({
        time: new Date().toLocaleString(),
        slot: slot.id,
        user: slot.user ?? "-",
        vehicle: slot.vehicle ?? "-",
        action
    });
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(logs));
}

function renderActivityLog() {
    const logs = JSON.parse(localStorage.getItem(ACTIVITY_KEY)) || [];
    activityLogBody.innerHTML = "";

    logs.forEach(log => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${log.time}</td>
            <td>${log.slot}</td>
            <td>${log.user}</td>
            <td>${log.vehicle}</td>
            <td>${log.action}</td>
        `;
        activityLogBody.appendChild(row);
    });
}

/* BOOK SLOT */
bookingForm.addEventListener("submit", e => {
    e.preventDefault();

    const slotId = parseInt(slotNumberInput.value);
    const user = userNameInput.value.trim();
    const vehicle = vehicleNumberInput.value.trim();

    if (!user || !vehicle) return;

    const slots = getSlots();
    const slot = slots.find(s => s.id === slotId);

    slot.booked = true;
    slot.user = user;
    slot.vehicle = vehicle;

    saveSlots(slots);
    logActivity("Booked", slot);

    bookingForm.reset();
    bookingFormContainer.style.display = "none";

    confirmationDiv.style.display = "block";
    confirmationDiv.textContent = `Slot ${slotId} booked successfully for ${user}`;

    renderSlots();
    renderAdminPanel();
    updateAnalytics();
    renderActivityLog();
});

/* CANCEL */
function cancelBooking(slotId) {
    const slots = getSlots();
    const slot = slots.find(s => s.id === slotId);

    if (!confirm(`Cancel booking for Slot ${slotId}?`)) return;

    slot.booked = false;
    slot.user = null;
    slot.vehicle = null;

    saveSlots(slots);
    logActivity("Cancelled", slot);

    renderSlots();
    renderAdminPanel();
    updateAnalytics();
    renderActivityLog();
}

/* INIT */
initializeSlots();
renderSlots();
renderAdminPanel();
updateAnalytics();
renderActivityLog();
