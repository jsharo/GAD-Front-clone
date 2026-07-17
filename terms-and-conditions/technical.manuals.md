# Manuales del Sistema: Técnico y de Usuario

**Sistema Municipal de Trámites y Gestión de Firmas Electrónicas**  
_GAD Municipal de Cuenca_

---

# PARTE I: MANUAL TÉCNICO

## 1. Arquitectura y Tecnologías

El sistema está desarrollado bajo una arquitectura cliente-servidor desacoplada:

- **Frontend (React)**: Interfaz de usuario Single Page Application (SPA), estilizada con CSS puro y organizada en componentes funcionales.
- **Backend (Nest.js)**: Framework modular de Node.js en TypeScript, encargado de las APIs de negocio, control de estados y sistema de notificaciones.
- **Acceso a Datos (Prisma ORM)**: Mapeador objeto-relacional para interactuar con la base de datos PostgreSQL, garantizando consultas seguras y migraciones estructuradas.
- **Base de Datos (PostgreSQL)**: Almacén relacional de la información de trámites, estados e historial.

```
+------------------+         REST API         +-------------------+
|  Cliente React   |  <====================>  |  Backend Nest.js  |
+------------------+                          +-------------------+
                                                        ||
                                                        || Prisma ORM
                                                        \/
                                              +-------------------+
                                              |    PostgreSQL     |
                                              +-------------------+
```

---

## 2. Modelado de Base de Datos (Prisma Schema)

A continuación, se define el esquema del modelo de datos de Prisma (`schema.prisma`) utilizado para dar soporte a los flujos y transiciones de estados:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  CIUDADANO
  ARQUITECTO
  SECRETARIA
  TECNICO
}

enum TramiteState {
  PENDING_SECRETARY
  OBSERVED
  PENDING_TECHNICIAN
  INSPECTION
  PENDING_PAYMENT
  PAID
  APPROVED
}

model User {
  id                String             @id @default(uuid())
  email             String             @unique
  name              String
  role              Role               @default(CIUDADANO)
  signatureRegistry SignatureRegistry? // Relación 1:1 con su firma base registrada
  tramites          Tramite[]          // Trámites iniciados por el usuario
  createdAt         DateTime           @default(now())
}

model SignatureRegistry {
  id             String   @id @default(uuid())
  userId         String   @unique
  user           User     @relation(fields: [userId], references: [id])
  signatureHash  String   // Hash criptográfico de la firma base (primer registro)
  registeredAt   DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

model Tramite {
  id           String         @id @default(uuid())
  title        String         // "Línea de Fábrica", "Aprobación de Planos", "Permiso de Construcción"
  description  String?
  state        TramiteState   @default(PENDING_SECRETARY)
  citizenId    String
  citizen      User           @relation(fields: [citizenId], references: [id])
  documents    Document[]
  logs         StateLog[]     // Historial de cambios de estado (Auditoría)
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt
}

model Document {
  id          String   @id @default(uuid())
  tramiteId   String
  tramite     Tramite  @relation(fields: [tramiteId], references: [id])
  name        String
  fileUrl     String
  signedHash  String   // Hash de la firma contenida en el documento cargado
  isValidated Boolean  @default(false)
  uploadedAt  DateTime @default(now())
}

model StateLog {
  id         String       @id @default(uuid())
  tramiteId  String
  tramite    Tramite      @relation(fields: [tramiteId], references: [id])
  fromState  TramiteState
  toState    TramiteState
  changedBy  String       // ID o nombre del funcionario responsable del cambio
  comment    String?      // Observaciones del cambio (ej. detalles de la inspección)
  changedAt  DateTime     @default(now())
}
```

---

## 3. Lógica del Motor de Estados y Contraste de Firmas (Nest.js)

### 3.1. Transición de Estados

Las transiciones de estados del trámite son gestionadas por el servicio `TramiteService`. Solo se permiten cambios de estado autorizados por rol de acuerdo con el flujo de negocio establecido:

- `CIUDADANO`: Solo puede iniciar el trámite en estado `PENDING_SECRETARY` o corregir si está en `OBSERVED`.
- `SECRETARIA`: Puede transicionar entre `PENDING_SECRETARY` $\rightarrow$ `PENDING_TECHNICIAN` o `PENDING_SECRETARY` $\rightarrow$ `OBSERVED`. También realiza el cambio de `PAID` $\rightarrow$ `APPROVED`.
- `TECNICO`: Gestiona las transiciones `PENDING_TECHNICIAN` $\rightarrow$ `INSPECTION` $\rightarrow$ `PENDING_PAYMENT`.

### 3.2. Contraste de Firma Electrónica

Cuando un usuario ingresa un documento firmado para un trámite:

1.  El `SignatureService` captura el hash criptográfico del archivo firmado.
2.  Busca en la tabla `SignatureRegistry` el hash base registrado por primera vez para ese usuario.
3.  Compara ambos hashes de forma estricta.
4.  Si **no coinciden**:
    - Marca el documento como `isValidated = false`.
    - Ejecuta el disparador `AlertNotificationGateway` para enviar una alerta Websocket/correo en tiempo real al panel del rol de **Secretaría**.
    - Pausa el flujo de estados del trámite de manera automática impidiendo su transición a `PENDING_TECHNICIAN`.

---

# PARTE II: MANUAL DE USUARIO

El sistema cuenta con interfaces y privilegios claramente diferenciados según el rol del usuario que inicie sesión:

```
+---------------------------------------------------------------------------------+
|                                 ROLES DE USUARIO                                 |
+----------------------+--------------------------+-------------------------------+
| Ciudadano            | Arquitecto               | Secretaría / Técnico          |
| - Inicia trámites    | - Carga diseños técnicos | - Revisa solicitudes y firmas |
| - Firma contratos    | - Firma planos           | - Gestiona transiciones       |
| - Lee T&C (Estático) | - Lee T&C (Estático)     | - Recibe alertas de fraude    |
+----------------------+--------------------------+-------------------------------+
```

## 1. Manual del Ciudadano

### 1.1. Registro Inicial de Firma Electrónica (Firma Base)

- **Paso 1**: Al iniciar sesión por primera vez, el sistema solicitará que registre su firma electrónica base.
- **Paso 2**: Cargue su certificado digital `.p12` o firme en el dispositivo digitalizador autorizado. El sistema generará una firma patrón inalterable vinculada a su usuario.
- **Paso 3**: Este registro se realizará una sola vez.

### 1.2. Lectura y Aceptación de Términos y Condiciones

- Los Términos y Condiciones, políticas de uso y políticas de manejo de datos se presentan en una vista estática e independiente del sistema.
- Debe marcar la casilla de aceptación obligatoria antes de iniciar cualquier trámite administrativo. Este check opera a nivel del cliente web (React) y no requiere conexión a base de datos externa para mayor seguridad.

### 1.3. Inicio de Trámites

- Seleccione el trámite a realizar: **Línea de Fábrica** o **Permiso de Construcción**.
- Complete los datos del predio, cargue los documentos solicitados y firme la solicitud con su firma electrónica.

---

## 2. Manual del Arquitecto

- **Carga de Documentación Técnica**: El arquitecto ingresará al módulo de **Aprobación de Planos**.
- **Carga de Planos Firmados**: Deberá cargar los planos en formato PDF/CAD debidamente firmados electrónicamente con su firma técnica autorizada.
- **Contraste y Bloqueo**: Si la firma del arquitecto no coincide con la registrada previamente en su perfil profesional, el sistema le advertirá y no le permitirá transicionar el plano hasta que se valide la identidad o sea desbloqueado por Secretaría.

---

## 3. Manual de Funcionarios (Secretaría y Técnicos)

### 3.1. Módulo de Secretaría (Recepción y Alertas)

- **Revisión Documental**: La Secretaría visualiza la lista de trámites entrantes en estado `PENDING_SECRETARY`.
- **Panel de Alertas de Firma**: Si un ciudadano o arquitecto carga una firma que no coincide con su registro inicial, la Secretaría verá una alerta resaltada en rojo en su pantalla principal con la opción de auditar el trámite.
- **Transiciones**: Puede cambiar el estado del trámite a `OBSERVED` (para correcciones del ciudadano) o a `PENDING_TECHNICIAN` (si todo es válido) para transferirlo al equipo evaluador.

### 3.2. Módulo del Técnico (Evaluación e Inspección)

- **Evaluación de Trámite**: El Técnico recibe el trámite en estado `PENDING_TECHNICIAN`.
- **Inspección de Campo**: Tras agendar y realizar la inspección, cambia el estado del trámite a `INSPECTION` y registra sus observaciones en el formulario técnico del sistema.
- **Generación de Cobro**: Si el informe técnico es favorable, cambia el estado a `PENDING_PAYMENT` y carga la orden de cobro municipal.
