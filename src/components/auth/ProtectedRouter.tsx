import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

type Props = {
	children: React.ReactElement;
	allowedRoles?: string[];
};

const ProtectedRouter = ({ children, allowedRoles }: Props) => {
	const { user } = useAuth();

	if (!user) return <Navigate to="/login" replace />;
	if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;

	return children;
};

export default ProtectedRouter;
