exports.passwordResetTemplate = (name, resetLink) => {
  return `<!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Réinitialisation de votre mot de passe</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          }
          
          .container {
            max-width: 600px;
            margin: 20px auto;
            padding: 40px;
            background-color: #f7fafc;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          
          .logo {
            text-align: center;
            margin-bottom: 30px;
          }
          
          .logo img {
            max-width: 150px;
          }
          
          .content {
            background: white;
            padding: 30px;
            border-radius: 8px;
          }
          
          h1 {
            color: #2d3748;
            font-size: 24px;
            margin-bottom: 20px;
          }
          
          p {
            color: #4a5568;
            line-height: 1.6;
            margin-bottom: 20px;
          }
          
          .reset-button {
            display: inline-block;
            background-color: #4299e1;
            color: white !important;
            padding: 12px 24px;
            border-radius: 5px;
            text-decoration: none;
            font-weight: bold;
            margin: 20px 0;
          }
          
          .warning {
            color: #e53e3e;
            font-size: 14px;
            margin-top: 25px;
            padding-top: 15px;
            border-top: 1px solid #e2e8f0;
          }
          
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #718096;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <img src="https://[VOTRE-LOGO].png" alt="Logo Plateforme">
          </div>
          
          <div class="content">
            <h1>Réinitialisation de mot de passe</h1>
            
            <p>Bonjour ${name},</p>
            
            <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour procéder à la modification :</p>
            <p>${resetLink}</p>
            
            <a href="${resetLink}" class="reset-button">Réinitialiser mon mot de passe</a>
            
            <p class="warning">
              ⚠️ Ce lien expirera dans 15 minutes.<br>
              Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email.
            </p>
          </div>
          
          <div class="footer">
            <p>Cet email a été envoyé automatiquement - Merci de ne pas y répondre</p>
            <p>© ${new Date().getFullYear()} [Nom de votre plateforme]. Tous droits réservés.</p>
          </div>
        </div>
      </body>
      </html>`;
};
