document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // Send mail when user submits the email composition form
  document.querySelector("#compose-form").onsubmit = send_email;
  
  // By default, load the inbox
  load_mailbox('inbox');
});

// Displays email composition form
function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

// Loads a mailbox
function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Retrieve emails in mailbox
  fetch(`/emails/${mailbox}`)

  // Convert response to json
  .then(function(response) {
    return response.json();
  })

  // Iterate through emails, creating a new div for each email and adding it to the DOM
  .then(function(emails) {
    emails.forEach(function(email) {
      const div = create_email_info(email);
      document.querySelector("#emails-view").append(div);
    })
  })

  // Catch any errors and log them to console
  .catch(function(err) {
    console.log(err);
  })
}

// Creates a new div that displays info about an email
// Characteristics of the div for an email:
//    - Grey background if the email is read, white background if the email is unread
//    - Each email displays the sender, subject, and timestamp
//    - The id of the email is added to the div as data
//    - When the div is clicked, the email is marked as read and a full rendering of the email contents are displayed
function create_email_info(email) {
  const sender = email.sender;
  const subject = email.subject;
  const timestamp = email.timestamp;
  const read = email.read;
  const id = email.id;
  
  const div = document.createElement("div");
  if (read) {
    div.className = "read-email";
  } else {
    div.className = "unread-email";
  }
  div.innerHTML = `
    <div>
      <span style="font-weight: bold">${subject}</span>
      <span style="float: right">${timestamp}</span>
    </div>
    <div>${sender}</div>
  `;
  div.dataset.id = id;
  div.addEventListener("click", function() {
    mark_as_read(id);
    view_email(id);
  })

  return div;
}

// Marks the email with id = emailId as read
function mark_as_read(emailId) {
  fetch(`/emails/${emailId}`, {
    method: "PUT",
    body: JSON.stringify({
      read: true
    })
  })

  // Catch any errors and log them to console
  .catch(function(err) {
    console.log(err);
  })

  // Prevent default submission 
  return false;
}

// Displays the full email (sender, recipients, subject, timestamp, and body) for email with id = emailId
function view_email(emailId) {

  // Show the email view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Retrieve email with id = emailId
  fetch(`/emails/${emailId}`)

  // Convert response to json
  .then(function(response) {
    return response.json();
  })

  // Set the inner HTML for the email view to display the full email
  .then(function(email) {
    create_email_full(email);
  })

  // Catch any errors and log them to console
  .catch(function(err) {
    console.log(err);
  })
}

// Sets the inner HTML for the email view to display the full email (sender, recipients, subject, timestamp, and body)
function create_email_full(email) {
  const sender = email.sender;
  const recipients = email.recipients;
  const subject = email.subject;
  const timestamp = email.timestamp;
  const body = email.body;

  const div = document.querySelector("#email-view");
  div.innerHTML = `
      <div id="email-headers">
        <div><span style="font-weight: bold">From: </span>${sender}</div>
        <div><span style="font-weight: bold">To: </span>${recipients}</div>
        <div><span style="font-weight: bold">Subject: </span>${subject}</div>
        <div><span style="font-weight: bold">Timestamp: </span>${timestamp}</div>
      </div>
      <div id="email-body">${body}</div>
    `;
}

// Sends an email composed in the email composition form
function send_email() {
  const recipients = document.querySelector("#compose-recipients").value;
  const subject = document.querySelector("#compose-subject").value;
  const body = document.querySelector("#compose-body").value;

  // Send email
  fetch("/emails", {
    method: "POST",
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
    })
  })
  
  // Convert response to json
  .then(function(response) {
    return response.json();
  })

  // Log response to console
  .then(function(response) {
    console.log(response);
  })

  // Catch any errors and log them to console
  .catch(function(err) {
    console.log(err);
  })

  // Load sent mailbox
  load_mailbox("sent");

  // Prevent default submission
  return false;
}
