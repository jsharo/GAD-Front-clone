import React, { createContext, useContext, useState, type ReactNode } from 'react';

export type Role = 'INVITADO' | 'CIUDADANO' | 'SECRETARIA' | 'TECNICO' | 'FINANCIERO' | 'ADMIN';

type User = {
	id: string;
	name: string;
	role: Role;
};

type AuthContextType = {
	user: User | null;
	login: (user: User) => void;
	logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<User | null>(null);

	const login = (u: User) => setUser(u);
	const logout = () => setUser(null);

	return (
		<AuthContext.Provider value={{ user, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error('useAuth must be used within AuthProvider');
	return ctx;
};

export default AuthContext;
