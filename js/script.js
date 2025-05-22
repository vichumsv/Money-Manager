const icons = document.querySelectorAll(".dash-icon");
const screen = document.querySelectorAll(".screen");
const submit = document.getElementById("trans-submit");
const table = document.getElementById("history-data");
const historyFilter = document.querySelectorAll(".history");

let transTab = document.querySelectorAll(".trans-tab");
let transType = "";
let amount = document.getElementById("trans-amount");
let date = document.getElementById("trans-date");
let description = document.getElementById("trans-description");
let history = [];
let income = 0;
let expense = 0;
let balance = 0;
let edited = false;
let editedId = 0;
let idCounter = 0;

//---- Getting Current Date ----//

currentDate();

//---- Side Panel Icons Click ----//
icons.forEach((icon, iconIdx) => {
  icon.addEventListener("click", () => {
    icons.forEach((i) => i.classList.remove("active"));
    icon.classList.add("active");
    screen.forEach((screen, scrIdx) => {
      screen.classList.add("hide");
      if (iconIdx == scrIdx) {
        screen.classList.remove("hide");
      }
    });
    transTab.forEach((t) => t.classList.remove("active"));
    edited = false;
    currentDate();
    reset();
  });
});

//---- Income / Expense Click ----//
transTab.forEach((type) => {
  type.addEventListener("click", () => {
    transTab.forEach((t) => t.classList.remove("active"));
    type.classList.add("active");
    transType = type.textContent;
    toggleSubmit();
  });
});

//---- Submit button Enable ----//
function toggleSubmit() {
  if (
    transType != "" &&
    amount.value != "" &&
    description.value != "" &&
    date.value != ""
  ) {
    submit.classList.add("enable");
  } else {
    submit.classList.remove("enable");
  }
}

//---- Submit button click----//

submit.addEventListener("click", (e) => {
  e.preventDefault();

  if (submit.classList.contains("enable")) {
    if (edited) {
      history.filter((item) => {
        if (item.id == editedId) {
          (item.transaction = transType),
            (item.amount = amount.value),
            (item.date = date.value),
            (item.description = description.value);
        }
      });
      edited = false;
    } else {
      history.push({
        id: idCounter++,
        transaction: transType,
        amount: amount.value,
        date: date.value,
        description: description.value,
      });
    }
    reset();
    console.log(history);
    createRecord(history);
    totalStat();
  }
});

//---- History Filter Click ----//
historyFilter.forEach((el) => {
  el.addEventListener("click", () => {
    historyFilter.forEach((el) => el.classList.remove("active"));
    el.classList.add("active");
    let filter = el.textContent;
    let filterArr = history.filter((item) => {
      if (item.transaction == filter) {
        return item;
      }
    });
    filter == "All" ? createRecord(history) : createRecord(filterArr);
  });
});

//---- Create Record ----//
function createRecord(arr) {
  table.innerHTML = "";
  table.innerHTML = `<tr>
                      <th>S.No</th>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Description</th>
                      <th>Action</th>
                    </tr>`;

  arr.forEach((item, idx) => {
    let record = `
    <tr data-id=${item.id}>
        <td>${idx + 1}</td>
        <td>${item.date.split("-").reverse().join("-")}</td>   
        <td>${item.transaction}</td>
        <td>${item.amount}</td>
        <td>${item.description}</td>
        <td>
          <span class="trans-edit" onclick="editTrans(event)"><i class="fa-solid fa-pen-to-square" title="Edit"></i></span>
          <span> | </span>
          <span class="trans-delete" onclick="deleteTrans(event)"><i class="fa-solid fa-trash-can" title="Delete"></i></span>
        </td>
    </tr>`;
    table.innerHTML += record;
  });
}

//---- Edit Click ----//
function editTrans(e) {
  edited = true;
  const dataID = e.target.closest("[data-id]");
  editedId = Number(dataID.getAttribute("data-id"));

  icons.forEach((icon) => icon.classList.remove("active"));
  icons[1].classList.add("active");

  screen.forEach((scr) => scr.classList.add("hide"));
  screen[1].classList.remove("hide");

  history.forEach((item) => {
    if (item.id == editedId) {
      transType = item.transaction;
      transTab.forEach((t) => t.classList.remove("active"));
      transTab.forEach((t) => {
        if (t.textContent === transType) {
          t.classList.add("active");
        }
      });
      amount.value = item.amount;
      date.value = item.date;
      description.value = item.description;
    }
  });
}

//---- Delete Click ----//
function deleteTrans(e) {
  const dataID = e.target.closest("[data-id]");
  const index = Number(dataID.getAttribute("data-id"));

  const del = confirm("Do you want to delete?");

  if (del) {
    if (!isNaN(index)) {
      history.forEach((item, idx) => {
        if (item.id == index) {
          history.splice(idx, 1);
        }
      });
      createRecord(history);
    }
    totalStat();
  }
}

//---- Date ----//
function currentDate() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0"); // months are 0-based
  const dd = String(today.getDate()).padStart(2, "0");
  const yyyy_mm_dd = `${yyyy}-${mm}-${dd}`; // ✅ input format
  date.value = yyyy_mm_dd;
}

//---- Total & Balance ----//
function totalStat() {
  income = history
    .filter((item) => item.transaction == "Income")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  expense = history
    .filter((item) => item.transaction == "Expense")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  balance = income - expense;

  document.getElementById("income-amt").innerHTML = income;
  document.getElementById("expense-amt").innerHTML = expense;
  document.getElementById("balance-amt").innerHTML = balance;

  myChart.data.datasets[0].data = [income, expense, balance];
  myChart.update();

  updateData();
}

//---- Reset ----//
function reset() {
  transType = "";
  amount.value = "";
  description.value = "";
  transTab.forEach((t) => t.classList.remove("active"));
  submit.classList.remove("enable");
}

//---- Chart ----//
const ctx = document.getElementById("myChart").getContext("2d");
const incomeValue = income;
const expenseValue = expense;
const balanceValue = balance;

const myChart = new Chart(ctx, {
  type: "bar",
  data: {
    labels: ["Income", "Expenses", "Balance"],
    datasets: [
      {
        label: "Amount",
        data: [incomeValue, expenseValue, balanceValue],
        backgroundColor: [
          "rgb(27, 84, 27)",
          "rgb(157, 27, 27)",
          "rgb(60, 93, 189)",
        ],
        borderWidth: 1,
      },
    ],
  },
  options: {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  },
});

getData();

//---- Update data to Local Storage ----//
function updateData() {
  localStorage.clear();
  if (history.length > 0 && idCounter > -1) {
    const record = JSON.stringify(history);
    const idNum = JSON.stringify(idCounter);
    localStorage.setItem("records", record);
    localStorage.setItem("idNum", idNum);
    console.log("Saved:", record);
    console.log("idNum:", idNum);
  } else {
    console.log("Nothing to save. History is empty.");
  }
}

//---- Get data from Local Storage ----//
function getData() {
  let records = localStorage.getItem("records");
  let idData = localStorage.getItem("idNum");
  if (records) {
    history = JSON.parse(records);
    idCounter = JSON.parse(idData);
    createRecord(history);
    totalStat();
  } else {
    history = [];
  }
}
