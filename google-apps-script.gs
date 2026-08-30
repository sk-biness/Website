/**
 * S K Enterprises — Contact form email sender
 * ---------------------------------------------
 * This script receives the website's contact form submission and sends
 * an email straight from your Gmail account, with the visitor's address
 * set as "Reply-To" — so hitting Reply in Gmail replies to THEM, not to
 * yourself.
 *
 * SETUP (about 5 minutes, no coding needed beyond copy-paste):
 *
 * 1. Go to https://script.google.com while logged into the Gmail account
 *    you want enquiries to arrive in (e.g. skbusiness576@gmail.com).
 * 2. Click "New project".
 * 3. Delete any placeholder code in the editor, then paste this whole file.
 * 4. Update the RECIPIENT_EMAIL constant below if needed (defaults to
 *    skbusiness576@gmail.com).
 * 5. Click the Save icon (or Ctrl/Cmd+S), give the project a name like
 *    "SK Enterprises Contact Form".
 * 6. Click "Deploy" (top right) -> "New deployment".
 * 7. Click the gear icon next to "Select type" and choose "Web app".
 * 8. Fill in:
 *      Description:      Contact form handler
 *      Execute as:        Me
 *      Who has access:    Anyone
 * 9. Click "Deploy". The first time, Google will ask you to authorize
 *    the script — click through "Advanced" -> "Go to (project) (unsafe)"
 *    if you see a warning screen (this is normal for your own scripts).
 * 10. Copy the "Web app URL" it gives you — it looks like:
 *     https://script.google.com/macros/s/AKfycb.../exec
 * 11. Open assets/js/main.js in the website files, find the line near
 *     the top that says:
 *         var CONTACT_FORM_ENDPOINT = "PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE";
 *     and replace the placeholder text with the URL you just copied
 *     (keep the quotes).
 * 12. Save, re-upload the site. Done — form submissions will now land
 *     directly in that Gmail inbox, and replying goes straight back to
 *     the visitor.
 *
 * If you ever need to change anything about the form later (add a field,
 * change the recipient), just edit this script and click
 * Deploy -> Manage deployments -> Edit (pencil) -> New version -> Deploy.
 */

var RECIPIENT_EMAIL = "skbusiness576@gmail.com";

function doPost(e) {
  try {
    var params = e.parameter;
    var name = (params.name || "").toString().trim();
    var email = (params.email || "").toString().trim();
    var phone = (params.phone || "").toString().trim();
    var message = (params.message || "").toString().trim();

    var subject = "New website enquiry from " + (name || "a visitor");

    var body =
      "You have a new enquiry from the S K Enterprises website.\n\n" +
      "Name: " + (name || "-") + "\n" +
      "Email: " + (email || "-") + "\n" +
      "Phone: " + (phone || "-") + "\n\n" +
      "Message:\n" + (message || "-") + "\n\n" +
      "---\n" +
      "Reply to this email to respond directly to " + (name || "the visitor") + ".";

    var mailOptions = {
      to: RECIPIENT_EMAIL,
      subject: subject,
      body: body,
    };

    // Only set replyTo if the visitor actually gave a valid-looking email,
    // otherwise fall back to your own address so Reply still works.
    if (email && email.indexOf("@") > -1) {
      mailOptions.replyTo = email;
    }

    MailApp.sendEmail(mailOptions);

    return ContentService.createTextOutput(
      JSON.stringify({ result: "success" })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ result: "error", message: err.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
