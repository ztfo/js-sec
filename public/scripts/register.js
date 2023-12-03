function submitStep1() {
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;

    fetch('/confirm', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fullName, email }),
    })
    .then(response => response.json())
    .then(data => {
        // Show the QR code
        document.getElementById('qr-code').src = data.qrCode;

        // Hide step 1 and show step 2
        document.getElementById('step-1').classList.remove('active');
        document.getElementById('step-2').classList.add('active');
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

document.getElementById('registration-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const token = document.getElementById('token').value;
    const email = document.getElementById('email').value;

    fetch('/verify-mfa', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, email }),
    })
    .then(response => {
        if (response.ok) {
            // Redirect to login page
            window.location.href = '/login';
        } else {
            console.error('MFA verification failed');
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});