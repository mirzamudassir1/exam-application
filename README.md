[README.md](https://github.com/user-attachments/files/31083052/README.md)

A full-stack exam management platform built for STEM assessments, with a custom rich-text editor that supports mathematical and chemical notation out of the box.

![MERN](https://img.shields.io/badge/stack-MERN-informational)
![React](https://img.shields.io/badge/frontend-React%2019-61DAFB?logo=react)
![Node](https://img.shields.io/badge/backend-Node%2FExpress-339933?logo=node.js)
![MongoDB](https://img.shields.io/badge/database-MongoDB-47A248?logo=mongodb)
![License](https://img.shields.io/badge/license-MIT-green)

## Overview

QuizPro solves a problem most quiz/exam builders ignore: writing STEM content (equations, chemical formulas, matrices) is painful in a plain text editor. QuizPro ships a custom rich-text editor purpose-built for this, on top of a complete exam management system — question banks, test creation, and assessment delivery.

## Features

- **Custom Rich Text Editor** (`RichEditor.jsx`) with:
  - Math notation via MathLive — fractions, scripts, radicals, matrices
  - Chemistry notation support
  - Tab-based navigation between formula slots
  - Matrix cell navigation
  - Expanded symbol library
- **Exam management** — create, organize, and deliver STEM assessments
- **Full-stack MERN architecture** for a responsive, real-time experience
- **Modular editor components** — also published separately as [`mirza-math-chem-editor`](https://www.npmjs.com/package/mirza-math-chem-editor) on npm, including `MathRibbon`, `ChemRibbon`, `CustomMathEditor`, and `FloatingMathChemTable`

## Tech Stack

| Layer      | Technology                  |
|------------|------------------------------|
| Frontend   | React 19                    |
| Backend    | Node.js, Express             |
| Database   | MongoDB                      |
| Math/Chem  | MathLive, KaTeX               |

## Project Structure

```
quizpro/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   └── RichEditor.jsx
│   │   └── ...
├── server/                 # Express backend
│   ├── routes/
│   ├── models/
│   └── ...
├── .env.example
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB (local instance or Atlas connection string)
- npm or yarn

### Installation

```bash
# Clone the repo
git clone https://github.com/<your-username>/quizpro.git
cd quizpro

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### Environment Variables

Create a `.env` file in the `server` directory:

```env
MONGODB_URI=your_mongodb_connection_string
PORT=5000
JWT_SECRET=your_jwt_secret
```

### Running Locally

```bash
# Start the backend (from /server)
npm run dev

# Start the frontend (from /client)
npm run dev
```

The app should now be running at `http://localhost:5173` (or your configured Vite port), with the API on `http://localhost:5000`.



## Contributing

Contributions, issues, and feature requests are welcome. Feel free to check the [issues page](https://github.com/<your-username>/quizpro/issues).

## Author

**Mirza**
- Building AI/ML and full-stack projects, currently pursuing B.Tech in AI & Data Science.
