import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import ProtectedRouter from '../components/auth/ProtectedRouter';
import Login from '../pages/Login';
import CitizenDashboard from '../pages/dashboards/CitizenDashboard';
import SecretariaDashboard from '../pages/dashboards/SecretariaDashboard';
import TecnicoDashboard from '../pages/dashboards/TecnicoDashboard';
import FinancieroDashboard from '../pages/dashboards/FinancieroDashboard';
import AdminDashboard from '../pages/dashboards/AdminDashboard';

const AppRouter = () => {
	return (
		<AuthProvider>
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<Navigate to="/login" replace />} />
					<Route path="/login" element={<Login />} />

					<Route
						path="/ciudadano"
						element={
							<ProtectedRouter allowedRoles={["CIUDADANO", "INVITADO"]}>
								<CitizenDashboard />
							</ProtectedRouter>
						}
					/>

					<Route
						path="/secretaria"
						element={
							<ProtectedRouter allowedRoles={["SECRETARIA"]}>
								<SecretariaDashboard />
							</ProtectedRouter>
						}
					/>

					<Route
						path="/tecnico"
						element={
							<ProtectedRouter allowedRoles={["TECNICO"]}>
								<TecnicoDashboard />
							</ProtectedRouter>
						}
					/>

					<Route
						path="/financiero"
						element={
							<ProtectedRouter allowedRoles={["FINANCIERO"]}>
								<FinancieroDashboard />
							</ProtectedRouter>
						}
					/>

					<Route
						path="/admin"
						element={
							<ProtectedRouter allowedRoles={["ADMIN"]}>
								<AdminDashboard />
							</ProtectedRouter>
						}
					/>
				</Routes>
			</BrowserRouter>
		</AuthProvider>
	);
};

export default AppRouter;
