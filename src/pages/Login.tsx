import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, Role } from '../context/AuthContext';

const Login = () => {
	const { login } = useAuth();
	const navigate = useNavigate();
	const [name, setName] = useState('');
	const [role, setRole] = useState<Role>('CIUDADANO');

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const user = { id: '1', name: name || 'Usuario', role };
		login(user);
		// redirect based on role
		switch (role) {
			case 'CIUDADANO':
			case 'INVITADO':
				navigate('/ciudadano');
				break;
			case 'SECRETARIA':
				navigate('/secretaria');
				break;
			case 'TECNICO':
				navigate('/tecnico');
				break;
			case 'FINANCIERO':
				navigate('/financiero');
				break;
			case 'ADMIN':
				navigate('/admin');
				break;
			default:
				navigate('/');
		}
	};

	return (
		<div style={{ padding: 24 }}>
			<h2>Login (demo)</h2>
			<form onSubmit={handleSubmit}>
				<div>
					<label>Nombre</label>
					<input value={name} onChange={(e) => setName(e.target.value)} />
				</div>
				<div>
					<label>Rol</label>
					<select value={role} onChange={(e) => setRole(e.target.value as Role)}>
						<option value="CIUDADANO">Ciudadano</option>
						<option value="INVITADO">Invitado</option>
						<option value="SECRETARIA">Secretaría</option>
						<option value="TECNICO">Técnico</option>
						<option value="FINANCIERO">Financiero</option>
						<option value="ADMIN">Administrador</option>
					</select>
				</div>
				<button type="submit">Entrar</button>
			</form>
		</div>
	);
};

export default Login;
