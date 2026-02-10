const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".panel");
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modal-title");
const modalForm = document.getElementById("modal-form");
const modalClose = document.getElementById("modal-close");
const modalCancel = document.getElementById("modal-cancel");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.remove("active"));
    panels.forEach((p) => p.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(tab.dataset.tab).classList.add("active");
  });
});

async function fetchJson(path) {
  const res = await fetch(path);
  if (!res.ok) {
    throw new Error(`Failed ${path}`);
  }
  return res.json();
}

function renderCards(containerId, items, mapFn) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  if (!items.length) {
    container.innerHTML = `<div class="card"><p>No data yet.</p></div>`;
    return;
  }
  items.forEach((item) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = mapFn(item);
    container.appendChild(card);
  });
}

function openModal(title, fields, onSubmit) {
  modalTitle.textContent = title;
  modalForm.innerHTML = "";
  fields.forEach((field) => {
    const wrapper = document.createElement("div");
    const label = document.createElement("label");
    label.textContent = field.label;
    wrapper.appendChild(label);

    let input;
    if (field.type === "select") {
      input = document.createElement("select");
      field.options.forEach((opt) => {
        const option = document.createElement("option");
        option.value = opt.value;
        option.textContent = opt.label;
        input.appendChild(option);
      });
    } else if (field.type === "textarea") {
      input = document.createElement("textarea");
      input.rows = 3;
    } else {
      input = document.createElement("input");
      input.type = field.type || "text";
    }
    input.name = field.name;
    if (field.placeholder) input.placeholder = field.placeholder;
    if (field.value != null) input.value = field.value;
    wrapper.appendChild(input);
    modalForm.appendChild(wrapper);
  });

  modalForm.onsubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(modalForm);
    const payload = Object.fromEntries(data.entries());
    await onSubmit(payload);
    closeModal();
  };

  modal.classList.remove("hidden");
}

function closeModal() {
  modal.classList.add("hidden");
  modalForm.innerHTML = "";
}

modalClose.addEventListener("click", closeModal);
modalCancel.addEventListener("click", closeModal);

async function loadAll() {
  try {
    const me = await fetchJson("/api/me");
    const meta = document.getElementById("admin-meta");
    meta.textContent = `${me.user.name || "Admin"} · ${me.user.role} · ${me.user.email || "no email"}`;
  } catch (err) {
    document.getElementById("admin-meta").textContent = "Unable to load admin profile.";
  }

  try {
    const employees = await fetchJson("/api/employees");
    renderCards("employees-grid", employees, (e) => `
      <h3>${e.name}</h3>
      <p>${e.title || "No title"} · ${e.department || "No department"}</p>
      <p>Status: ${e.status}</p>
    `);
  } catch {}

  try {
    const onboarding = await fetchJson("/api/onboarding");
    renderCards("onboarding-grid", onboarding, (o) => `
      <h3>${o.title}</h3>
      <p>Status: ${o.status}</p>
      <p>Due: ${o.dueDate ? new Date(o.dueDate).toLocaleDateString() : "N/A"}</p>
    `);
  } catch {}

  try {
    const invoices = await fetchJson("/api/invoices");
    renderCards("invoices-grid", invoices, (i) => `
      <h3>${i.customerName}</h3>
      <p>Amount: $${(i.amountCents / 100).toFixed(2)}</p>
      <p>Status: ${i.status}</p>
    `);
  } catch {}

  try {
    const payroll = await fetchJson("/api/payroll");
    renderCards("payroll-grid", payroll, (p) => `
      <h3>Pay Period</h3>
      <p>${new Date(p.periodStart).toLocaleDateString()} - ${new Date(p.periodEnd).toLocaleDateString()}</p>
      <p>Net: $${(p.netPayCents / 100).toFixed(2)} · ${p.status}</p>
    `);
  } catch {}
}

document.getElementById("refresh").addEventListener("click", loadAll);

document.querySelectorAll("[data-action]").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const action = btn.dataset.action;
    if (action === "add-employee") {
      openModal("Add Employee", [
        { name: "name", label: "Name" },
        { name: "email", label: "Email", type: "email" },
        { name: "title", label: "Title" },
        { name: "department", label: "Department" },
        {
          name: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Active", value: "ACTIVE" },
            { label: "Inactive", value: "INACTIVE" },
            { label: "Onboarding", value: "ONBOARDING" }
          ]
        },
        { name: "salaryCents", label: "Salary (cents)", type: "number" },
        { name: "hourlyRateCents", label: "Hourly Rate (cents)", type: "number" }
      ], async (payload) => {
        payload.salaryCents = payload.salaryCents ? Number(payload.salaryCents) : undefined;
        payload.hourlyRateCents = payload.hourlyRateCents ? Number(payload.hourlyRateCents) : undefined;
        await fetch("/api/employees", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        await loadAll();
      });
    }

    if (action === "add-onboarding") {
      openModal("Add Onboarding Task", [
        { name: "employeeId", label: "Employee ID" },
        { name: "title", label: "Title" },
        {
          name: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Not started", value: "NOT_STARTED" },
            { label: "In progress", value: "IN_PROGRESS" },
            { label: "Done", value: "DONE" }
          ]
        },
        { name: "dueDate", label: "Due Date", type: "date" },
        { name: "notes", label: "Notes", type: "textarea" }
      ], async (payload) => {
        payload.dueDate = payload.dueDate || undefined;
        await fetch("/api/onboarding", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        await loadAll();
      });
    }

    if (action === "add-invoice") {
      openModal("Add Invoice", [
        { name: "customerName", label: "Customer Name" },
        { name: "customerEmail", label: "Customer Email", type: "email" },
        { name: "amountCents", label: "Amount (cents)", type: "number" },
        {
          name: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Draft", value: "DRAFT" },
            { label: "Sent", value: "SENT" },
            { label: "Paid", value: "PAID" },
            { label: "Overdue", value: "OVERDUE" }
          ]
        },
        { name: "issuedDate", label: "Issued Date", type: "date" },
        { name: "dueDate", label: "Due Date", type: "date" },
        { name: "paidDate", label: "Paid Date", type: "date" }
      ], async (payload) => {
        payload.amountCents = payload.amountCents ? Number(payload.amountCents) : undefined;
        await fetch("/api/invoices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        await loadAll();
      });
    }

    if (action === "add-payroll") {
      openModal("Add Pay Record", [
        { name: "employeeId", label: "Employee ID" },
        { name: "periodStart", label: "Period Start", type: "date" },
        { name: "periodEnd", label: "Period End", type: "date" },
        { name: "grossPayCents", label: "Gross Pay (cents)", type: "number" },
        { name: "deductionsCents", label: "Deductions (cents)", type: "number" },
        { name: "netPayCents", label: "Net Pay (cents)", type: "number" },
        {
          name: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Pending", value: "PENDING" },
            { label: "Paid", value: "PAID" }
          ]
        }
      ], async (payload) => {
        payload.grossPayCents = payload.grossPayCents ? Number(payload.grossPayCents) : undefined;
        payload.deductionsCents = payload.deductionsCents ? Number(payload.deductionsCents) : 0;
        payload.netPayCents = payload.netPayCents ? Number(payload.netPayCents) : undefined;
        await fetch("/api/payroll", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        await loadAll();
      });
    }
  });
});

loadAll();
