# Plantillas de correo (Supabase → Authentication → Emails → Templates)

Cada archivo `.html` va en la plantilla del mismo nombre; el **asunto** (Subject) va en el campo de arriba.

| Plantilla de Supabase | Archivo | Asunto |
|---|---|---|
| Confirmar registro | `1-confirmar-registro.html` | Tu código de verificación de Vitrina |
| Invitacion | `2-invitacion.html` | Te invitaron a Vitrina |
| Enlace magico | `3-enlace-magico.html` | Tu enlace para entrar a Vitrina |
| Cambio de correo | `4-cambio-de-correo.html` | Confirma tu nuevo correo en Vitrina |
| Restablecer contrasena | `5-restablecer-contrasena.html` | Restablece tu contraseña de Vitrina |
| Reautenticacion | `6-reautenticacion.html` | Tu código de seguridad de Vitrina |

Variables que usan: `{{ .Token }}` (código), `{{ .ConfirmationURL }}` (enlace), `{{ .Email }}`, `{{ .NewEmail }}`.
El código de «Confirmar registro» es el que se escribe en la pantalla de registro de la app (6 dígitos: Authentication → Sign In / Providers → Email → *Email OTP Length* = 6).
