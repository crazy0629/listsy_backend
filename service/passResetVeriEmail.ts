export const passwordResetVerificationEmail = (link: string, name: string) => {
  return `<!DOCTYPE html>
  <html lang="en">
  
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link
      href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap"
      rel="stylesheet" />
    <title>Verify your email address</title>
    <style>
      * {
        font-family: "Roboto", sans-serif;
        box-sizing: border-box;
      }
  
      div.root {
        max-width: 768px;
        margin: auto;
        width: 100%;
      }
  
      body {
        padding: 100px;
        margin: 0;
      }
  
      img.logo {
        margin-bottom: 90px;
      }
  
      h1.title {
        color: #000;
        font-size: 40px;
        font-weight: 700;
        margin-bottom: 64px;
      }
  
      div.description {
        color: #000;
        font-size: 16px;
        font-weight: 400;
        margin-bottom: 80px;
      }
  
      a.verify {
        display: block;
        padding: 31px 0;
        text-align: center;
        border-radius: 100px;
        background: #ff6f00;
        text-decoration: none;
        border: none;
        outline: none;
        cursor: pointer;
        max-width: 648px;
        width: 100%;
        margin: auto;
        margin-bottom: 64px;
        color: #fff;
        font-size: 16px;
        font-weight: 400;
      }
  
      div.footer {
        text-align: center;
        max-width: 508px;
        width: 100%;
        margin: auto;
      }
  
      div.link {
        margin-bottom: 32px;
      }
  
      div.link a {
        color: #000;
        font-size: 16px;
        font-weight: 400;
        display: inline-block;
        margin: 0 20px;
        text-decoration: none;
      }
  
      div.footer p {
        color: #000;
  
        font-size: 16px;
        font-weight: 400;
      }
    </style>
  </head>
  
  <body>
    <div class="root">
      <img src="https://www.listsy.app/public/img/front/logo.png" alt="logo" class="logo" />
      <h1 class="title">Verify your email to reset your password</h1>
      <div class="description">
        <p>Hi, ${name},</p>
        <p>
          We're sending you this email because you requested a password reset. Click on this link to create a new
          password:
        </p>
      </div>
      <a class="verify" href="${link}" target="_blank">
        Verify Email to reset password
      </a>
      <div class="description">
        <p>
          If you didn't request a password reset, you can ignore this email. Your password will not be changed.
        </p>
        <p>The Support Team</p>
      </div>
      <div class="footer">
        <div class="link">
          <a href="#">Privacy Policy</a> | <a href="#">Contact Support</a>
        </div>
        <p>
          655 Montgomery Street, Suite 490, Dpt 17022, San Francisco, CA 94111 ©
          2023 Listsy.
        </p>
      </div>
    </div>
  </body>
  </html>`;
};
