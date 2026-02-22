# CohortPro - Cohort-Based Learning Platform

A modern React frontend for a SaaS cohort-based learning platform. Built with React, Vite, TypeScript, Tailwind CSS, Supabase Auth, and React Router.

## Features

### Authentication
- Email/password authentication via Supabase Auth
- Role-based access control (Student/Tutor)
- Protected routes with automatic redirects
- Persistent session management

### Public Pages
- **Home Page**: Landing page with platform overview and features
- **Courses Page**: Browse all available courses
- **Course Details Page**: View course info and available batches with enrollment option

### Student Features
- **My Enrollments**: View enrolled courses and upcoming live sessions
- **Join Live Classes**: Interactive live session interface with Zoom Web SDK placeholder

### Tutor Features
- **Tutor Dashboard**: Complete management interface with tabs for:
  - Create and manage courses
  - Create batches for courses
  - Schedule live sessions

## Tech Stack

- **Framework**: React 18 + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (40+ pre-installed components)
- **Authentication**: Supabase Auth
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Icons**: Lucide React

## Project Structure

```
src/
├── components/
│   ├── layout/           # Layout components (Navbar, ProtectedRoute)
│   ├── ui/              # shadcn/ui components
│   └── ui-custom/       # Custom UI components (LoadingSpinner, ErrorMessage, EmptyState)
├── contexts/
│   └── AuthContext.tsx   # Authentication state management
├── lib/
│   ├── constants.ts      # App constants and routes
│   ├── supabase.ts       # Supabase client configuration
│   └── utils.ts          # Utility functions
├── pages/
│   ├── Home.tsx          # Landing page
│   ├── Login.tsx         # Login page
│   ├── Register.tsx      # Registration page
│   ├── Courses.tsx       # Course listing
│   ├── CourseDetails.tsx # Course details with batches
│   ├── MyEnrollments.tsx # Student enrollments
│   ├── TutorDashboard.tsx # Tutor management dashboard
│   └── LiveClass.tsx     # Live session page
├── services/
│   └── api.ts            # API service layer with Axios
├── types/
│   └── index.ts          # TypeScript type definitions
├── App.tsx               # Main app component with routing
└── main.tsx             # Entry point
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (for authentication)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd cohortpro
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Update the `.env` file with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=http://localhost:8000/api
```

5. Start the development server:
```bash
npm run dev
```

6. Build for production:
```bash
npm run build
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes |
| `VITE_API_BASE_URL` | Backend API base URL | No (defaults to localhost) |

## API Integration

The project includes a complete API service layer in `src/services/api.ts`. Currently, it uses mock data for development. To connect to your backend:

1. Update the API functions in `src/services/api.ts` to call your actual endpoints
2. The Axios instance automatically attaches the JWT token from Supabase to all requests
3. All API functions are typed with TypeScript interfaces

### Example API Call

```typescript
import { coursesApi } from '@/services/api';

// Get all courses
const courses = await coursesApi.getAll();

// Get course by ID
const course = await coursesApi.getById('course-id');
```

## Authentication Flow

1. Users register/login via Supabase Auth
2. User role (student/tutor) is stored in user_metadata
3. JWT token is automatically attached to API requests
4. Protected routes check authentication state
5. Role-based routes check user role

## Routing

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Home page |
| `/login` | Public | Login page |
| `/register` | Public | Registration page |
| `/courses` | Public | Course listing |
| `/courses/:id` | Public | Course details |
| `/my-enrollments` | Authenticated (Students) | Student enrollments |
| `/tutor-dashboard` | Authenticated (Tutors) | Tutor dashboard |
| `/live-class/:sessionId` | Authenticated | Live session page |

## Customization

### Adding New Pages

1. Create the page component in `src/pages/`
2. Add the route in `src/App.tsx`
3. Add navigation link in `src/components/layout/Navbar.tsx` (if needed)

### Adding New API Endpoints

1. Add TypeScript interfaces in `src/types/index.ts`
2. Add API functions in `src/services/api.ts`
3. Use the API in your components

### Styling

- Tailwind CSS is pre-configured
- shadcn/ui components are customizable
- Global styles in `src/index.css`

## Zoom Web SDK Integration

The Live Class page includes a placeholder for Zoom Web SDK integration. To implement:

1. Install Zoom Web SDK: `npm install @zoomus/websdk`
2. Import and initialize the SDK in `src/pages/LiveClass.tsx`
3. Use the credentials from `liveSessionsApi.getJoinCredentials()`

## Production Deployment

1. Build the application:
```bash
npm run build
```

2. The `dist/` folder contains the production build

3. Deploy to your hosting platform (Vercel, Netlify, etc.)

## Contributing

This project is designed for educational purposes. Feel free to extend and customize for your needs.

## License

MIT License - feel free to use for your university projects!
