# Especificación de Requerimientos de Software (SRS)

**Estándar IEEE 830 - Sistema Municipal de Trámites y Gestión de Firmas**  
_GAD Municipal de Cuenca_

---

## 1. Introducción

Este documento detalla la Especificación de Requerimientos de Software (SRS) según el estándar **IEEE 830** para el Sistema Municipal de Trámites, Verificación de Firmas Electrónicas y Gestión de Términos y Condiciones.

---

## 2. Requerimientos Funcionales (RF) y Matriz de Trazabilidad

A continuación, se presenta la matriz de requerimientos del sistema mapeada con las tecnologías y responsables:

| ID Requerimiento | Descripción del Requerimiento                                                                                                       | Componente Tecnológico        | Prioridad | Mapeo de Base de Datos (Prisma) |
| :--------------- | :---------------------------------------------------------------------------------------------------------------------------------- | :---------------------------- | :-------- | :------------------------------ |
| **RF-01**        | El sistema debe permitir el registro único y almacenamiento cifrado de la firma electrónica base del usuario.                       | Nest.js (`SignatureRegistry`) | Alta      | `SignatureRegistry`             |
| **RF-02**        | El sistema debe comparar de forma automática la firma electrónica de cada solicitud contra el registro base inicial.                | Nest.js + Postgres            | Alta      | `Document.signedHash`           |
| **RF-03**        | Si el contraste de firmas falla, el sistema debe pausar el trámite y notificar por WebSocket al rol de Secretaría.                  | Nest.js / React               | Alta      | `Document.isValidated = false`  |
| **RF-04**        | El sistema debe gestionar el flujo secuencial de estados de los trámites: Línea de Fábrica, Planos y Construcción.                  | Nest.js (`TramiteState`)      | Alta      | `Tramite.state`                 |
| **RF-05**        | El sistema debe permitir a los arquitectos cargar planos técnicos firmados digitalmente para el trámite de Aprobación de Planos.    | React / Nest.js               | Alta      | `Document` / `Tramite`          |
| **RF-06**        | El sistema debe desplegar de forma estática e independiente los Términos y Condiciones para ciudadanos, arquitectos y funcionarios. | React (Estático)              | Media     | Ninguno (Aislado)               |
| **RF-07**        | El sistema debe llevar una bitácora inmutable de auditoría para cada transición de estado de trámite efectuada por funcionarios.    | Prisma ORM                    | Alta      | `StateLog`                      |

---

## 3. Reglas de Negocio (RN)

- **RN-01 (Registro de Firma Base)**: Solo se permite registrar una firma electrónica base por usuario (relación 1:1). Cualquier actualización de la firma base debe ser autorizada por el rol de Secretaría de forma presencial.
- **RN-02 (Contraste de Firma)**: Si el hash de la firma estampada en un trámite es diferente del hash en `SignatureRegistry` en al menos un carácter, el trámite entra en estado de bloqueo automático y se alerta al funcionario.
- **RN-03 (Independencia Jurídica)**: El módulo de Términos y Condiciones no debe enlazarse con lógica dinámica de backend Nest.js. Debe funcionar de manera puramente informativa y estática en la capa React para mitigar fallos legales por caídas de base de datos.
- **RN-04 (Restricción de Transición de Estados)**: Un trámite no puede avanzar en el flujo si tiene una alerta de firma activa pendiente de resolver por el rol de Secretaría.

---

## 4. Casos de Uso del Sistema

### Caso de Uso 01: Registrar Firma Electrónica Base

- **Actor**: Ciudadano / Arquitecto
- **Precondición**: Usuario autenticado sin firma registrada previamente.
- **Flujo Principal**:
  1. El usuario accede al menú de configuración de perfil.
  2. Selecciona "Registrar Firma Base".
  3. Carga su certificado de firma electrónica `.p12`.
  4. El sistema extrae de forma segura el identificador único del certificado, calcula el hash y lo almacena en `SignatureRegistry`.
  5. Muestra mensaje de éxito y habilita el inicio de trámites.

### Caso de Uso 02: Contraste de Firma y Alerta de Inconsistencia

- **Actor**: Ciudadano / Arquitecto (iniciador), Secretaría (receptor de alerta).
- **Precondición**: Firma base previamente registrada en el sistema.
- **Flujo Principal**:
  1. El ciudadano carga un documento firmado en formato `.p12` o PDF firmado digitalmente en el trámite de "Permiso de Construcción".
  2. El backend en Nest.js intercepta el documento y obtiene el hash de la firma actual.
  3. El sistema compara el hash actual con el hash almacenado en `SignatureRegistry`.
  4. El sistema detecta que los hashes no coinciden.
  5. **Flujo de Excepción**:
     - El sistema cambia el estado del documento a no validado.
     - Envía una alerta inmediata vía WebSocket al panel del rol de Secretaría.
     - El trámite se mantiene retenido bloqueando la transición a los técnicos evaluadores.

---

## 5. Historias de Usuario (User Stories)

### Historia de Usuario 1: Registro Inicial de Firma

- **Como** ciudadano / arquitecto,
- **Quiero** registrar mi firma electrónica por primera vez de forma rápida,
- **Para** que sirva como patrón de autenticidad en todos mis trámites del municipio.
- **Criterios de Aceptación**:
  - El sistema solo debe permitir archivos válidos de firma electrónica.
  - Se debe almacenar el hash cifrado de la firma, no la clave privada del certificado.
  - Solo se permite un único registro base por usuario.

### Historia de Usuario 2: Alertas de Fraude para Secretaría

- **Como** funcionario del rol de Secretaría,
- **Quiero** recibir una notificación en tiempo real si el sistema detecta que la firma del ciudadano en una solicitud no coincide con su registro base,
- **Para** evitar la suplantación de identidad y actuar legalmente de forma oportuna.
- **Criterios de Aceptación**:
  - La notificación debe aparecer en rojo en el dashboard principal de Secretaría inmediatamente al ocurrir la falla.
  - Debe contener el nombre del ciudadano, el ID del trámite y la fecha/hora del intento.
  - El trámite debe quedar bloqueado y no apto para asignación técnica.

### Historia de Usuario 3: Aceptación de Términos y Condiciones Aislada

- **Como** ciudadano del sistema,
- **Quiero** leer de manera clara y estática los términos y condiciones antes de iniciar mi trámite,
- **Para** conocer el tratamiento que tendrán mis firmas y datos de carácter personal sin generar errores por caídas de base de datos.
- **Criterios de Aceptación**:
  - La visualización debe ser estática y 100% responsiva (ancho A4).
  - El botón de "Aceptar" debe ser gestionado a nivel de interfaz de usuario de React.
