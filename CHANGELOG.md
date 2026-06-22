# 1.0.0 (2026-06-22)

### Bug Fixes

- align simulated statistics and secure AdminDashboard component from TypeErrors with Hot Self-Healing logic ([39e0596](https://github.com/InstitutoSudamericano/gadca-ar_fronted/commit/39e05960c8fe7ca7dff23c88c140192305a5d11c))
- ensure citizen requests demo data is populated regardless of localstorage cache ([c9c19ae](https://github.com/InstitutoSudamericano/gadca-ar_fronted/commit/c9c19aefaf692eafdffd4add5b50f7b46709ef18))
- prevent search filter crash on undefined citizen properties in BandejaSecretaria ([e1ea2fb](https://github.com/InstitutoSudamericano/gadca-ar_fronted/commit/e1ea2fb29b88e0969a1cbae2791d7291ab97efaa))
- protect BandejaSecretaria list operations and render loop from cache issues ([03ed557](https://github.com/InstitutoSudamericano/gadca-ar_fronted/commit/03ed5571600257a147a1748700c1fbfb8d95277f))
- protect requests rendering and detail links from nully or cached values ([cb78033](https://github.com/InstitutoSudamericano/gadca-ar_fronted/commit/cb7803372f1f4d79ee9dec095df54b27eabe6b81))
- remove E-Government status bar from LandingTopbar ([34104a4](https://github.com/InstitutoSudamericano/gadca-ar_fronted/commit/34104a44ec9425b47ac7f474989e50b7f10b6c53))
- resolve page blank crashes on invalid dates and add reset demo button in MisSolicitudes ([76084ae](https://github.com/InstitutoSudamericano/gadca-ar_fronted/commit/76084ae6988391b26a0156a56bde325bfbeac38f))
- secure AdminAuditoria from TypeErrors, correct blockchain entity mapping, and implement Hot Self-Healing logic ([6910136](https://github.com/InstitutoSudamericano/gadca-ar_fronted/commit/6910136f145a08f823ca5c44a08811db579d4850))
- secure AdminSolicitudes from TypeErrors, correct citizen mapping, and implement Hot Self-Healing logic ([2b2bace](https://github.com/InstitutoSudamericano/gadca-ar_fronted/commit/2b2bace4d2e4eae17e0fa4723ffe6fec8cb66453))
- secure CobrosPendientes component from crashes and implement Hot Self-Healing logic ([0427d77](https://github.com/InstitutoSudamericano/gadca-ar_fronted/commit/0427d77fabd64e56a54045b9977af753be248480))
- secure SecretariaTecnicos loading, filtering and counts from crash on legacy data ([02ce903](https://github.com/InstitutoSudamericano/gadca-ar_fronted/commit/02ce9039a6f66158732cf78f02ab490f0a9b2ed7))

### Continuous Integration

- setup gitflow architecture, ci/cd pipelines and code quality tools ([508cd90](https://github.com/InstitutoSudamericano/gadca-ar_fronted/commit/508cd90195f4f1adc5fdc309323496299316a123))

### Features

- complete interactive role-based routing and offline simulator with mockDb ([3543a72](https://github.com/InstitutoSudamericano/gadca-ar_fronted/commit/3543a720f69bb1e6a612e745235d5590b89f1810))
- **dashboards+login:** scaffold role dashboards and auth context ([d704c20](https://github.com/InstitutoSudamericano/gadca-ar_fronted/commit/d704c2066f771804ccc76d774fbf6a1a644765a6))
- define ciudadano roles — INVITADO vs VERIFICADO ([fabbc93](https://github.com/InstitutoSudamericano/gadca-ar_fronted/commit/fabbc9386e53fb7dd6c1b522f4a402897d2a20f2))
- implement Hot Self-Healing & Autodiagnosis wrapper in BandejaSecretaria to secure layout rendering ([96ab9a3](https://github.com/InstitutoSudamericano/gadca-ar_fronted/commit/96ab9a332c5f2202bfd571922e07abeb7312699d))
- institutional topbar + enhanced landing page ([e61b490](https://github.com/InstitutoSudamericano/gadca-ar_fronted/commit/e61b490b734bfea63cabeea463a2d70a63fcefe8))
- migrate complete GAD Cañar frontend - all roles, layouts and pages ([4938be3](https://github.com/InstitutoSudamericano/gadca-ar_fronted/commit/4938be3200016a84ecb640f7e564a3f777c2e155))
- minimal login with auto-redirect + guest access ([04d3a1a](https://github.com/InstitutoSudamericano/gadca-ar_fronted/commit/04d3a1a2cfbd59cd2bd37ce53fa6e3c06f53bcbd))
- redesign AdminDashboard with stunning data analytics and clean layout links ([cef7ed7](https://github.com/InstitutoSudamericano/gadca-ar_fronted/commit/cef7ed7c351ef83db14e88543f33115ddfb860f7))
- remove auth guards — all routes public for UI review ([118ba5f](https://github.com/InstitutoSudamericano/gadca-ar_fronted/commit/118ba5fcbba5318b4008f7615e11eda5d075b9da))

### BREAKING CHANGES

- All commits must now follow Conventional Commits specification.
  Direct push to main and develop is forbidden — use Pull Requests.
