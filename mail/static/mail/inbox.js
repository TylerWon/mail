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

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
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
      const sender = email.sender;
      const subject = email.subject;
      const timestamp = email.timestamp;
      
      const div = document.createElement("div");
      if (email.read) {
        div.className = "read-email";
      } else {
        div.classname = "unread-email";
      }
      div.innerHTML = `
        <div>
          <span style="font-weight: bold">${subject}</span>
          <span style="float: right">${timestamp}</span>
        </div>
        <div>${sender}</div>
      `;

      document.querySelector("#emails-view").append(div);
    })
  })

  // Catch any errors and log them to console
  .catch(function(err) {
    console.log(err);
  })

  // Prevent default submission
  return false
}

function send_email() {
  // Prepare body of request
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