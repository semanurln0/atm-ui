// script.js
let bluetoothDevice;
let characteristic;
let cardData;
let pin = "1234"; // Default PIN for simplicity
let balance = 1000; // Default balance

document.getElementById('connect-btn').addEventListener('click', async () => {
  const statusElement = document.getElementById('status');

  try {
    // Connect to Bluetooth device
    bluetoothDevice = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: ['0000ffe0-0000-1000-8000-00805f9b34fb'] // Example service UUID
    });

    statusElement.textContent = 'Status: Connecting...';

    const server = await bluetoothDevice.gatt.connect();
    const service = await server.getPrimaryService('0000ffe0-0000-1000-8000-00805f9b34fb');
    characteristic = await service.getCharacteristic('0000ffe1-0000-1000-8000-00805f9b34fb');

    statusElement.textContent = 'Status: Connected';

    // Start listening for NFC card data
    characteristic.addEventListener('characteristicvaluechanged', (event) => {
      const value = new TextDecoder().decode(event.target.value);
      document.getElementById('received-card-data').value = value;
      cardData = value.trim();

      if (cardData) {
        alert("Card scanned successfully!");
        document.getElementById('step-1').classList.add('hidden');
        document.getElementById('step-2').classList.remove('hidden');
      }
    });

    await characteristic.startNotifications();
  } catch (error) {
    statusElement.textContent = `Status: Error - ${error.message}`;
  }
});

document.getElementById('validate-pin').addEventListener('click', () => {
  const enteredPin = document.getElementById('pin-input').value;
  const pinStatus = document.getElementById('pin-status');

  if (enteredPin === pin) {
    pinStatus.textContent = 'PIN validated! Accessing ATM menu...';
    document.getElementById('step-2').classList.add('hidden');
    document.getElementById('step-3').classList.remove('hidden');
  } else {
    pinStatus.textContent = 'Invalid PIN. Please try again.';
  }
});

document.getElementById('step-3').addEventListener('click', (e) => {
  if (e.target.dataset.action) {
    const action = e.target.dataset.action;
    const output = document.getElementById('atm-output');

    if (action === 'balance') {
      output.textContent = `Your current balance is $${balance}.`;
    } else if (action === 'withdraw') {
      const amount = prompt('Enter amount to withdraw:');
      if (amount <= balance) {
        balance -= amount;
        output.textContent = `You withdrew $${amount}. New balance: $${balance}.`;
      } else {
        output.textContent = 'Insufficient funds!';
      }
    } else if (action === 'deposit') {
      const amount = prompt('Enter amount to deposit:');
      balance += Number(amount);
      output.textContent = `You deposited $${amount}. New balance: $${balance}.`;
    } else if (action === 'exit') {
      alert('Thank you for using our ATM!');
      location.reload();
    }
  }
});
