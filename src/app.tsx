import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from '@/router/app.router';
import { ToastContainer } from '@/components/logic/toast.notification';

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppRouter />
      <ToastContainer />
    </BrowserRouter>
  );
}
