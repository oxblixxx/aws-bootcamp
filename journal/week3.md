# Week 3 — Decentralized Authentication
---

# Provision via ClickOps a Amazon Cognito User Pool
---
### Using the search bar, search for AWS COGNITO
###Click on Create User Pool
[!Create User Pool]()

Then click on preferred sign-in options, click on next when done
[!Create User Pool]()


Choose password police, ensure to include 1 number, special character, 1 uppercase and lowercase to streghten the password
NOTE: It's recommended to always set up MFA to secure access, but we won't be going through that process now 

Set an mode of account recovery incase of forgotten password. Email delivery is free and that will be what we will be using. SMS incurs bills. Then click on Next
[!Create User Pool]()

Enable the cognito to send and confirm and then chose mode to verify, email verification is being used
Choose required attributes matching with your Frontend UI and information you need from users. Click on Next
[!Create User Pool]()


"Send Email with AMAZON SES" is recommended for higher workloads with a registered email with AMAZON SES, incurs charges, Send Email with cognito will be used here. Click on Next
[!Create User Pool]()


Put in preferred pool name and then make the APP TYPE confidential as to nmake it private and generate a secret for use. Enter friendly name for App ensure it's generating a client secret then click on Next
[!Create User Pool]()

Review details filled, click create to create the preferred userpool.







