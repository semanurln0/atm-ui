let users = JSON.parse(localStorage.getItem('atmUsers')) || [
  { user_id: 'admin', password: '3372', accounts: { EUR: 1000, USD: 500, TRY: 0 } }
];
let currentUser = null;

function saveUsers() {
  localStorage.setItem('atmUsers', JSON.stringify(users));
}

function login() {
  const userId = document.getElementById('user-id').value;
  const password = document.getElementById('user-password').value;

  currentUser = users.find(user => user.user_id === userId && user.password === password);
  if (currentUser) {
    switchScreen('dashboard');
    displayBalances();
  } else {
    alert("Invalid User ID or Password");
  }
}

function openRegister() {
  switchScreen('register-screen');
}

function backToLogin() {
  switchScreen('login-screen');
}

function register() {
  const newUserId = document.getElementById('new-user-id').value;
  const newPassword = document.getElementById('new-user-password').value;

  if (users.some(user => user.user_id === newUserId)) {
    alert("User ID already exists.");
    return;
  }

  users.push({ user_id: newUserId, password: newPassword, accounts: { EUR: 0, USD: 0, TRY: 0 } });
  saveUsers();
  alert("Registration successful!");
  backToLogin();
}

function displayBalances() {
  const balancesDiv = document.getElementById('account-balances');
  balancesDiv.innerHTML = '<h3>Account Balances</h3>';
  for (const currency in currentUser.accounts) {
    if (currentUser.accounts[currency] > 0) {
      balancesDiv.innerHTML += `<p>${currency}: ${currentUser.accounts[currency]}</p>`;
    }
  }
}

function switchScreen(screenId) {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.add('hidden');
    screen.classList.remove('active');
  });
  document.getElementById(screenId).classList.remove('hidden');
  document.getElementById(screenId).classList.add('active');
}

function deposit() {
  const amount = parseFloat(prompt("Enter deposit amount:"));
  if (isNaN(amount) || amount <= 0) return;

  chooseAccount("Choose account to deposit to").then(account => {
    if (account) {
      currentUser.accounts[account] += amount;
      saveUsers();
      displayBalances();
      alert(`Deposited ${amount} ${account}.`);
    }
  });
}

function withdraw() {
  chooseAccount("Choose account to withdraw from").then(account => {
    const amount = parseFloat(prompt("Enter withdrawal amount:"));
    if (isNaN(amount) || amount <= 0 || currentUser.accounts[account] < amount) {
      alert("Invalid amount or insufficient funds.");
      return;
    }
    currentUser.accounts[account] -= amount;
    saveUsers();
    displayBalances();
    alert(`Withdrew ${amount} ${account}.`);
  });
}

const exchangeRates = {
  EUR: { USD: 1.05, TRY: 36.73 },
  USD: { EUR: 1 / 1.05, TRY: 34.96 },
  TRY: { EUR: 1 / 36.73, USD: 1 / 34.96 },
};

function transferMoney() {
  chooseAccount("Choose account to transfer from").then(sender => {
    if (!sender) return;

    chooseAccount("Choose account to transfer to").then(receiver => {
      if (!receiver) return;

      const amount = parseFloat(prompt(`Enter amount to transfer from ${sender}:`));
      if (isNaN(amount) || amount <= 0 || currentUser.accounts[sender] < amount) {
        alert("Invalid amount or insufficient funds.");
        return;
      }

      let convertedAmount = amount;

      // Apply exchange rate if currencies are different
      if (sender !== receiver) {
        convertedAmount = (amount * exchangeRates[sender][receiver]).toFixed(2);
        alert(
          `Currency Conversion:\n${amount} ${sender} = ${convertedAmount} ${receiver}`
        );
      }

      // Update balances
      currentUser.accounts[sender] -= amount;
      currentUser.accounts[receiver] = (currentUser.accounts[receiver] || 0) + parseFloat(convertedAmount);

      saveUsers();
      displayBalances();
      alert(`Transferred ${amount} ${sender} → ${convertedAmount} ${receiver}`);
    });
  });
}

function quickWithdrawal() {
  chooseAccount("Choose Account for Quick Withdrawal").then(account => {
    if (!account) return;

    const popup = document.getElementById('popup-container');
    popup.classList.remove('hidden');
    popup.innerHTML = `<h3>Quick Withdrawal for ${account}</h3>`;

    [10, 20, 50, 100, 500, 1000].forEach(amount => {
      const button = document.createElement("button");
      button.textContent = `${amount} ${account}`;
      button.onclick = () => {
        if (currentUser.accounts[account] >= amount) {
          currentUser.accounts[account] -= amount;
          saveUsers();
          displayBalances();
          alert(`Withdrew ${amount} ${account}.`);
          closePopup('popup-container');
        } else {
          alert("Insufficient funds.");
        }
      };
      popup.appendChild(button);
    });

    const cancel = document.createElement("button");
    cancel.textContent = "Cancel";
    cancel.onclick = () => closePopup('popup-container');
    popup.appendChild(cancel);
  });
}

function payments() {
  chooseAccount("Choose Account to Pay From").then(account => {
    if (!account) return;

    const recipientId = prompt("Enter Recipient User ID:");
    const amount = parseFloat(prompt("Enter Payment Amount:"));

    if (!recipientId || isNaN(amount) || amount <= 0) {
      alert("Invalid recipient or amount.");
      return;
    }

    const recipient = users.find(user => user.user_id === recipientId);
    if (!recipient) {
      alert("Recipient not found.");
      return;
    }

    if (currentUser.accounts[account] < amount) {
      alert("Insufficient funds.");
      return;
    }

    currentUser.accounts[account] -= amount;
    recipient.accounts[account] = (recipient.accounts[account] || 0) + amount;
    saveUsers();
    displayBalances();
    alert(`Paid ${amount} ${account} to ${recipientId}.`);
  });
}

function creditServices() {
  const popup = document.getElementById('popup-container');
  popup.classList.remove('hidden');
  popup.innerHTML = `
    <h3>Credit Card Services</h3>
    <button onclick="openCurrencyAccount('EUR')">Open EUR Account</button>
    <button onclick="openCurrencyAccount('USD')">Open USD Account</button>
    <button onclick="openCurrencyAccount('TRY')">Open TRY Account</button>
    <button onclick="changePassword()">Change Password</button>
    <button onclick="closePopup('popup-container')">Close</button>
  `;
}

function changePassword() {
  const newPassword = prompt("Enter your new password:");
  if (newPassword) {
    currentUser.password = newPassword;
    saveUsers();
    alert("Password changed successfully.");
  }
}

function openCurrencyAccount(currency) {
  if (currentUser.accounts[currency] !== undefined) {
    alert(`${currency} account already exists.`);
  } else {
    currentUser.accounts[currency] = 0;
    saveUsers();
    displayBalances();
    alert(`${currency} account opened successfully.`);
  }
}

function chooseAccount(title) {
  return new Promise(resolve => {
    const popup = document.getElementById('popup-container');
    popup.classList.remove('hidden');
    popup.innerHTML = `<h3>${title}</h3>`;
    Object.keys(currentUser.accounts).forEach(account => {
      const button = document.createElement("button");
      button.textContent = `${account} (${currentUser.accounts[account]})`;
      button.onclick = () => {
        popup.classList.add('hidden');
        resolve(account);
      };
      popup.appendChild(button);
    });
  });
}

function logout() {
  currentUser = null;
  switchScreen('login-screen');
}

function closePopup(id) {
  document.getElementById(id).classList.add('hidden');
}
