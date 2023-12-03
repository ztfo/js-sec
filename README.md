# ZTFO/Mini Express App

A simple Node.js and Express application exploring essential elements of full-stack development, including user interface, server logic, and database operations, with a focus on security.

## Core Features

- **Admin Interfaces**: Internal Admin dashboard with user management controls.
- **User Interfaces**: Registration and login screens.
- **Server Logic**: Express server managing routes, authentication, and session handling.
- **Database Integration**: PostgreSQL with Sequelize ORM.
- **Email Verification**: Implemented using SendGrid.
- **Enhanced Security**: Features HTTPS, rate limiting, and Helmet.

## Up Next
- **MFA**: Add multi-factor authentication 
- **Generic Landing Page** Add homepage and new login route

## Quick Start

1. Install dependencies: `npm install`
2. Set up the `.env` file for environment configuration.
3. Launch the application: `node app.js` and navigate to `http://localhost:3000`

----------------

## Message for Next Session

## Recent Updates

1. **Middleware Implementation:** The `ensureAuthenticated` middleware has been applied to the wager creation routes in `wagerRoutes.js`. This guarantees that only users who are logged in can access these routes.

2. **Dashboard Enhancements:** A "New Wager" button has been added to `dashboard.ejs`. This button directs users to the wager creation form.

## Current Progress

The application now supports basic user authentication. Users can sign up, log in, and log out. Once logged in, users can navigate to their dashboard and initiate new wagers. The dashboard currently shows a welcome message and a "New Wager" button.

## Future Developments

The following enhancements are planned for the dashboard:

- **Wager Overview:** Show a list of all wagers placed by the user, organized by day.
- **Budget Tracking:** Show the user's current monthly budget. The budget should be adjusted as new wagers are placed. If the budget drops below a certain limit, the wager creation form should be disabled until the budget is increased.

## Next Session Overview

In the upcoming session, we will focus on implementing the new dashboard features. This will involve creating new routes to fetch and update the user's wagers and monthly budget. Additionally, we will modify the `dashboard.ejs` file to display this information and manage the wager creation form submission.