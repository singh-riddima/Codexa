import { Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import FeaturesPage from './pages/FeaturesPage';
import AboutPage from './pages/AboutPage';
import CreatorPage from './pages/CreatorPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import GoogleAuthCallbackPage from './pages/GoogleAuthCallbackPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import ProgressPage from './pages/ProgressPage';
import TargetsPage from './pages/TargetsPage';
import CalendarPage from './pages/CalendarPage';
import MockInterviewPage from './pages/MockInterviewPage';
import MockExamPage from './pages/MockExamPage';
import RevisionFlashcardsPage from './pages/RevisionFlashcardsPage';
import DsaTrackerPage from './pages/DsaTrackerPage';
import CodingTrackerPage from './pages/CodingTrackerPage';
import CoreSubjectsPage from './pages/CoreSubjectsPage';
import AptitudePage from './pages/AptitudePage';
import AnalyticsPage from './pages/AnalyticsPage';
import SubjectDashboardPage from './pages/SubjectDashboardPage';
import TopicsPage from './pages/subject/TopicsPage';
import InterviewQuestionsPage from './pages/subject/InterviewQuestionsPage';
import PracticePage from './pages/subject/PracticePage';
import MocksPage from './pages/subject/MocksPage';
import FlashcardsPage from './pages/subject/FlashcardsPage';
import SubjectAnalyticsPage from './pages/subject/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { OnboardingRoute } from './components/layout/OnboardingRoute';

export const AppRoutes = [
  { path: '/', element: <LandingPage /> },
  { path: '/features', element: <FeaturesPage /> },
  { path: '/about', element: <AboutPage /> },
  { path: '/creator', element: <CreatorPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/signup', element: <SignupPage /> },
  { path: '/auth/google/callback', element: <GoogleAuthCallbackPage /> },
  {
    path: '/onboarding',
    element: (
      <OnboardingRoute>
        <OnboardingPage />
      </OnboardingRoute>
    )
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    )
  },
    {
      path: '/dashboard/profile',
      element: (
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      )
    },
    {
      path: '/dashboard/progress',
      element: (
        <ProtectedRoute>
          <ProgressPage />
        </ProtectedRoute>
      )
    },
    {
      path: '/dashboard/targets',
      element: (
        <ProtectedRoute>
          <TargetsPage />
        </ProtectedRoute>
      )
    },
    {
      path: '/dashboard/calendar',
      element: (
        <ProtectedRoute>
          <CalendarPage />
        </ProtectedRoute>
      )
    },
    {
      path: '/practice/mock-interview',
      element: (
        <ProtectedRoute>
          <MockInterviewPage />
        </ProtectedRoute>
      )
    },
    {
      path: '/practice/mock-exam',
      element: (
        <ProtectedRoute>
          <MockExamPage />
        </ProtectedRoute>
      )
    },
    {
      path: '/practice/revision-flashcards',
      element: (
        <ProtectedRoute>
          <RevisionFlashcardsPage />
        </ProtectedRoute>
      )
    },
  {
    path: '/dsa',
    element: (
      <ProtectedRoute>
        <DsaTrackerPage />
      </ProtectedRoute>
    )
  },
  {
    path: '/coding',
    element: (
      <ProtectedRoute>
        <CodingTrackerPage />
      </ProtectedRoute>
    )
  },
  {
    path: '/core-subjects',
    element: (
      <ProtectedRoute>
        <CoreSubjectsPage />
      </ProtectedRoute>
    )
  },
  {
    path: '/aptitude',
    element: (
      <ProtectedRoute>
        <AptitudePage />
      </ProtectedRoute>
    )
  },
  {
    path: '/analytics',
    element: (
      <ProtectedRoute>
        <AnalyticsPage />
      </ProtectedRoute>
    )
  },
  {
    path: '/subject/:subjectKey',
    element: (
      <ProtectedRoute>
        <SubjectDashboardPage />
      </ProtectedRoute>
    )
  },
  {
    path: '/subject/:subjectKey/topics',
    element: (
      <ProtectedRoute>
        <TopicsPage />
      </ProtectedRoute>
    )
  },
  {
    path: '/subject/:subjectKey/interview-questions',
    element: (
      <ProtectedRoute>
        <InterviewQuestionsPage />
      </ProtectedRoute>
    )
  },
  {
    path: '/subject/:subjectKey/practice',
    element: (
      <ProtectedRoute>
        <PracticePage />
      </ProtectedRoute>
    )
  },
  {
    path: '/subject/:subjectKey/mocks',
    element: (
      <ProtectedRoute>
        <MocksPage />
      </ProtectedRoute>
    )
  },
  {
    path: '/subject/:subjectKey/flashcards',
    element: (
      <ProtectedRoute>
        <FlashcardsPage />
      </ProtectedRoute>
    )
  },
  {
    path: '/subject/:subjectKey/analytics',
    element: (
      <ProtectedRoute>
        <SubjectAnalyticsPage />
      </ProtectedRoute>
    )
  },
  {
    path: '/settings',
    element: (
      <ProtectedRoute>
        <SettingsPage />
      </ProtectedRoute>
    )
  },
  { path: '/home', element: <Navigate to="/dashboard" replace /> },
  { path: '/about-creator', element: <Navigate to="/creator" replace /> },
  { path: '*', element: <NotFoundPage /> }
];