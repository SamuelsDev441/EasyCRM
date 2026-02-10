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

async function loadAll() {
  try {
    const me = await fetchJson("/api/me");
    const meta = document.getElementById("employee-meta");
    meta.textContent = `${me.user.name || "Employee"} · ${me.user.email || "no email"}`;
  } catch (err) {
    document.getElementById("employee-meta").textContent = "Unable to load profile.";
  }

  try {
    const onboarding = await fetchJson("/api/onboarding");
    renderCards("onboarding-grid", onboarding, (o) => `
      <h3>${o.title}</h3>
      <p>Status: ${o.status}</p>
      <p>Due: ${o.dueDate ? new Date(o.dueDate).toLocaleDateString() : "N/A"}</p>
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
loadAll();
