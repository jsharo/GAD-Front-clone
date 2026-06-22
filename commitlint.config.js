// commitlint.config.js
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // Nueva funcionalidad
        'fix', // Corrección de bug
        'refactor', // Refactorización sin cambio de comportamiento
        'docs', // Documentación
        'style', // Formato/espaciado (sin cambio de lógica)
        'test', // Agregar o modificar tests
        'chore', // Mantenimiento, configuración
        'ci', // Cambios en CI/CD
        'perf', // Mejora de rendimiento
        'revert', // Revertir commit anterior
      ],
    ],
    // El asunto debe estar en minúsculas
    'subject-case': [2, 'always', 'lower-case'],
    // Máximo 72 caracteres en el asunto
    'subject-max-length': [2, 'always', 72],
    // No punto final en el asunto
    'subject-full-stop': [2, 'never', '.'],
    // Líneas del cuerpo máximo 100 caracteres
    'body-max-line-length': [2, 'always', 100],
  },
};
