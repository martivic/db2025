// Firebase Config
const firebaseConfig = {
  
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Utility Functions
function updateField(selector, value) {
    const field = document.querySelector(selector);
    if (field) {
        field.value = value || '';
    } else {
        console.warn(`Field ${selector} not found.`);
    }
}

function toggleSpinner(show) {
    const spinner = document.querySelector('.spinner-border');
    if (spinner) {
        spinner.style.display = show ? 'inline-block' : 'none';
    }
}

function showError(message) {
    const errorMsg = document.querySelector('#error-message');
    if (errorMsg) {
        errorMsg.innerText = message;
        errorMsg.style.display = 'block';
    } else {
        alert(message);
    }
}

function validateFields(fields) {
    return fields.every((field) => field && field.trim().length > 0);
}

// Main Functions
function readUserDoc(id) {
    const collectionRef = db.collection('users');
    const userDoc = collectionRef.doc(id);

    toggleSpinner(true);
    console.log("Fetching document for ref id:", id);

    userDoc
        .get()
        .then((doc) => {
            toggleSpinner(false);
            if (!doc.exists) {
                showError("No data found for the provided ID.");
            } else {
                console.log("Document found:", doc.data());
                populateForm(doc.data());
                payloadSubmit(id, doc.data());
            }
        })
        .catch((error) => {
            toggleSpinner(false);
            console.error("Error fetching document:", error);
            showError("Error fetching data. Please try again later.");
        });
}

function populateForm(data) {
    updateField('#name', data.First_Name);
    updateField('#phone-number', data.Phone);
    updateField('#address', data.Address);
    updateField('#city', data.City_Name);
    updateField('#zipcode', data.Zip_Code);
    updateField('#loan1amt', data.Loan1_Amount);
    updateField('#statename', data.State_Name);
    updateField('#countryname', data.Country_Name);
    updateField('#loan1lender', data.Loan1_Lender);
    updateField('#assigneduser', data.Assigned_User);

    document.getElementById('data-form').style.display = 'block';
    document.querySelector('.search-container').style.display='none'
}

function payloadSubmit(id, data) {
    const payload = {
        firstName: data.First_Name,
        lastName: data.Last_Name,
        offerCode: id,
        phoneNumber: data.Phone,
        address: data.Address,
        city: data.City_Name,
        zipcode: data.Zip_Code,
        loanAmount: data.Loan1_Amount,
        state: data.State_Name,
        countryName: data.Country_Name,
        loan1Lender: data.Loan1_Lender,
        assignedUser: data.Assigned_User,
    };
    sendWebhook(payload);
    console.log(payload)
}

function sendWebhook(payload) {
    const webhookUrl = 'https://services.leadconnectorhq.com/hooks.....';
    fetch(webhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    })
        .then((response) => {
            if (response.ok) {
                console.log('Webhook sent successfully:', response);
            } else {
                console.error('Failed to send webhook:', response);
            }
        })
        .catch((error) => {
            console.error('Error sending webhook:', error);
        });
}

// Event Listeners
document.querySelector('#submitID').addEventListener('click', function () {
    const id = document.querySelector('#id').value;

    if (!validateFields([id])) {
        showError("Reference code is required.");
        return;
    }

    readUserDoc(id);
});
