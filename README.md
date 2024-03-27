# Serverless

This repository contains code for a serverless application that is triggered by a Google Cloud Function whenever a POST request for a user account creation is made and a message is published to a Pub/Sub topic. The application sends out an email to the user's email address with a verification link. The link contains a token and the email of the user whose account needs to be verified. Additionally, the application tracks the emails being sent out in a database.

## Tech Stack

The following technologies are used in this serverless application:

- Google Cloud Functions: The serverless compute platform used to trigger the application.
- Email Service: Mailgun service
- Database: Connects to Cloud SQL Instance and stores the email data there.

## Setup

To set up and deploy this serverless application, follow these steps:

1. Clone the repository:

    git clone https://github.com/your-username/serverless.git

2. Install the required dependencies:

    cd serverless
    npm install

3. Configure the necessary environment variables:

    - MAILGUN_API_KEY
    - DOMAIN
    - DB_HOST
    - DB_USER
    - DB_PASSWORD 
    - DB_PORT

## Usage

To use this serverless application, follow these steps:

1. Make a POST request to the Webapp endpoint with the necessary payload for user account creation.

2. The Google Cloud Function will be triggered when a message will be published to the specified Pub/Sub topic by the webapp.

3. The application will send out an email to the user's email address with a verification link.

4. The user can click on the verification link to verify their account.

5. The application will track the emails being sent out in the database.
