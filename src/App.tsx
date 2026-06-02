import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedLayout } from './components/Layout';
import { ExerciseDetailPage, ExerciseSearchPage, MyProgramsPage, MyQuestionsPage, ProgramDetailPage } from './pages/AthletePages';
import { LandingPage, LoginPage, StudentRegisterPage } from './pages/AuthPages';
import { AthleteDetailPage, AthletesPage, ExerciseManagementPage, NewProgramPage, NotificationsPage, QuestionsManagementPage } from './pages/CoachPages';
import { ForbiddenPage, ProtectedRoute, RoleGuard } from './features/auth';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage mode="student" />} />
      <Route path="/register" element={<StudentRegisterPage />} />
      <Route path="/coach-login" element={<LoginPage mode="staff" />} />
      <Route path="/forbidden" element={<ForbiddenPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<RoleGuard roles={['STUDENT']} />}>
          <Route path="/athlete" element={<ProtectedLayout />}>
            <Route index element={<Navigate to="/athlete/exercises" replace />} />
            <Route path="exercises" element={<ExerciseSearchPage />} />
            <Route path="exercises/:id" element={<ExerciseDetailPage />} />
            <Route path="questions" element={<MyQuestionsPage />} />
            <Route path="programs" element={<MyProgramsPage />} />
            <Route path="programs/:id" element={<ProgramDetailPage />} />
          </Route>
        </Route>

        <Route element={<RoleGuard roles={['COACH', 'ADMIN']} />}>
          <Route path="/coach" element={<ProtectedLayout />}>
            <Route index element={<Navigate to="/coach/athletes" replace />} />
            <Route path="athletes" element={<AthletesPage />} />
            <Route path="athletes/:id" element={<AthleteDetailPage />} />
            <Route path="athletes/:id/new-program" element={<NewProgramPage />} />
            <Route path="exercises" element={<ExerciseManagementPage />} />
            <Route path="questions" element={<QuestionsManagementPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
