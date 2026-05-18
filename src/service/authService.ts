// Servicio de autenticación
export const authService = {
  // Aquí puedes agregar llamadas a tu API real
  login: async (username: string, password: string) => {
    // Simulación de petición a servidor
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, token: 'fake-token' });
      }, 500);
    });
  },

  logout: () => {
    // Limpiar token, etc.
    localStorage.removeItem('authToken');
  },
};
