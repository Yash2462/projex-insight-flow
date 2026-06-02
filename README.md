# ProjeX - Modern Project Management Platform

ProjeX is a modern, intuitive project management platform built for speed and collaboration.

## Features

- **Project Management**: Create and track multiple projects.
- **Kanban Boards**: Drag-and-drop workflow management.
- **Real-time Collaboration**: Chat and notifications powered by WebSockets.
- **Analytics**: Detailed project insights and performance metrics.
- **Modern UI**: Clean, responsive interface built with shadcn-ui and Tailwind CSS.

## Technologies

- **Frontend**: Vite, React, TypeScript, TanStack Query, shadcn-ui, Tailwind CSS.
- **Backend**: Spring Boot 3, Spring Security (OAuth2/JWT), Spring Data JPA, WebSockets (STOMP).

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or bun

### Local Development

1.  **Clone the repository**
    ```sh
    git clone <repository-url>
    cd projex-insight-flow
    ```

2.  **Install dependencies**
    ```sh
    npm install
    ```

3.  **Set up environment variables**
    Create a `.env` file based on `.env.example`.

4.  **Start the development server**
    ```sh
    npm run dev
    ```

## Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the project for production.
- `npm run lint`: Runs ESLint for code quality.
- `npm run preview`: Previews the production build locally.
