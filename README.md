This project is built to enhance my skills in user authentication using JWT in node.js. It is a learning-based project,implemented authentication using JWT (JSON Web Token) and email-based verification with Nodemailer. The project covers user signup, signin, signout, email verification, and password reset.

Features

✔ User Signup – Register a new user with email & password.
✔ User Signin – Authenticate users using email & password.
✔ User Signout – Logout by removing the authentication token.
✔ Email Verification – Send a verification code via Gmail (Nodemailer).
✔ Verify Email – Validate the verification code to confirm the user’s email.
✔ Forgot Password – Send a password reset code via email, which is valid for a specific time.
✔ Update Password – By old password and token, it allow the user to create a new password.
✔ Secure Authentication – Uses JWT tokens for authentication.

Technology Stack

Node.js – Server-side runtime

Express.js – Web framework

MongoDB & Mongoose – Database & ODM

JWT (JSON Web Token) – Secure user authentication

Nodemailer – Send emails for verification & password reset

Bcrypt.js – Hashing & comparing passwords

Joi – Data validation for user input
