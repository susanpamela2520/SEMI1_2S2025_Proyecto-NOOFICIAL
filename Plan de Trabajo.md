# Plan de Trabajo - Proyecto CineMatch
## Distribución de Tareas para 4 Integrantes

---

## Consideraciones Generales Importantes

### ⚠️ Gestión de Cuenta AWS

**RECOMENDACIÓN CRÍTICA:** Todo el proyecto debe desarrollarse en **UNA SOLA CUENTA DE AWS**. Esto es fundamental porque:

- ✅ Los servicios pueden comunicarse entre sí sin problemas de permisos
- ✅ Los recursos están en la misma región y VPC
- ✅ Las configuraciones de seguridad son consistentes
- ✅ Se evitan problemas de facturación distribuida
- ✅ Más fácil de presentar y calificar
- ✅ Los buckets S3, RDS, y Load Balancer pueden ser accedidos por todos

### 🔐 Gestión de Usuarios IAM

Se debe crear un **usuario IAM para cada integrante** con las políticas necesarias:

1. **Creación de usuarios:**
   - Integrante 1 (Backend): IAM con permisos para EC2, RDS, Load Balancer
   - Integrante 2 (Frontend/S3): IAM con permisos para S3, CloudFront (opcional)
   - Integrante 3 (Serverless): IAM con permisos para Lambda, API Gateway
   - Integrante 4 (IA): IAM con permisos para servicios de IA (Rekognition, Polly, etc.)

2. **Permisos compartidos para todos:**
   - Acceso de lectura a CloudWatch (monitoreo)
   - Acceso a la documentación y billing (opcional)

3. **Usuario administrador:**
   - Designar a un integrante como coordinador con permisos de administrador para resolver problemas de permisos si surgen.

---

## Distribución de Tareas

### 👤 **Integrante 1: Backend, Base de Datos y Load Balancer** ✅ (Ya asignado)

#### Responsabilidades:

**1. Base de Datos (RDS o DynamoDB)**
- Diseñar el modelo de base de datos completo
- Crear y configurar RDS (MySQL/PostgreSQL) o DynamoDB
- Definir tablas/colecciones para:
  - Usuarios (con contraseñas encriptadas)
  - Películas
  - Reseñas
  - Calificaciones
  - Listas colaborativas
  - Emociones/sentimientos
- Configurar grupos de seguridad para acceso desde EC2
- Crear scripts de inicialización de BD
- Poblar base de datos con películas de ejemplo

**2. Instancias EC2 (2 servidores backend)**
- Crear 2 instancias EC2 (t2.micro o t3.micro)
- Configurar grupos de seguridad (puertos 80, 443, 22, puerto de aplicación)
- Desarrollar API REST con los siguientes endpoints:
  - POST `/api/register` - Registro de usuarios
  - POST `/api/login` - Inicio de sesión
  - GET `/api/movies` - Listar películas
  - GET `/api/movies/:id` - Detalle de película
  - POST `/api/movies/:id/rating` - Calificar película
  - POST `/api/movies/:id/review` - Crear reseña
  - GET `/api/user/profile` - Perfil de usuario
  - GET `/api/user/favorites` - Películas favoritas
  - POST `/api/user/favorites` - Agregar a favoritos
  - GET `/api/user/watched` - Películas vistas
  - POST `/api/lists` - Crear lista colaborativa
  - GET `/api/lists` - Obtener listas
  - POST `/api/lists/:id/movies` - Agregar película a lista
- Implementar autenticación con JWT o sesiones
- Conectar con base de datos
- Asegurar que ambos servidores sean idénticos funcionalmente

**3. Application Load Balancer**
- Crear Application Load Balancer
- Configurar Target Group con ambas instancias EC2
- Configurar Health Checks
- Configurar listeners (HTTP/HTTPS)
- Probar alta disponibilidad (apagar una instancia)
- Documentar la IP/DNS del Load Balancer

**4. Integración con Lambda**
- Consumir las APIs de Lambda (del Integrante 3) desde el backend
- Coordinar la integración entre backend y servicios serverless

**Entregables:**
- Base de datos desplegada y funcionando
- 2 instancias EC2 con APIs idénticas
- Load Balancer configurado
- Documentación de endpoints
- Scripts SQL o esquemas de BD
- Capturas de pantalla de configuraciones

---

### 👤 **Integrante 2: Frontend y Almacenamiento S3**

#### Responsabilidades:

**1. Desarrollo del Frontend (Web Estática)**
- Desarrollar la aplicación web usando:
  - React, Vue, Angular o framework de preferencia
  - HTML/CSS/JavaScript vanilla (alternativa)
- Implementar todas las vistas/páginas:
  - Página de registro
  - Página de inicio de sesión
  - Página principal (catálogo de películas)
  - Página de detalle de película
  - Página de perfil de usuario
  - Página de listas colaborativas
  - Página de búsqueda/filtros
- Diseño responsive y amigable (UI/UX)
- Integrar consumo de APIs del backend (Integrante 1)
- Integrar consumo de APIs Lambda (Integrante 3)
- Manejar estados de carga y errores
- Implementar autenticación (guardar tokens)

**2. Configuración de S3 - Sitio Web Estático**
- Crear bucket S3 para el sitio web estático
- Configurar bucket para hosting de sitio web
- Configurar políticas de acceso público
- Compilar el proyecto frontend
- Subir archivos estáticos (HTML, CSS, JS) a S3
- Habilitar CORS si es necesario
- Probar acceso desde la URL de S3
- (Opcional) Configurar CloudFront como CDN

**3. Configuración de S3 - Almacenamiento de Imágenes**
- Crear bucket S3 para imágenes (perfiles y carátulas)
- Organizar estructura de carpetas:
  - `/profiles/` - Fotos de perfil
  - `/movies/` - Carátulas de películas
- Configurar políticas para acceso público a imágenes
- Coordinar con Integrante 3 para subida de imágenes vía Lambda
- Poblar bucket con imágenes de películas de ejemplo
- Generar URLs de las imágenes para la BD

**4. Integración Frontend-Backend**
- Configurar variables de entorno con URLs de APIs
- Implementar llamadas HTTP a:
  - Backend (Load Balancer del Integrante 1)
  - APIs Lambda (API Gateway del Integrante 3)
  - Servicios de IA (a través de Lambda)
- Manejar respuestas y errores
- Implementar feedback visual para el usuario

**5. Funcionalidades del Frontend**
- Formularios de registro e inicio de sesión
- Catálogo de películas con paginación/filtros
- Sistema de calificación con estrellas
- Formulario de reseñas
- Botón "Traducir reseña" (integración con Lambda)
- Botón "Escuchar reseña" (integración con Lambda)
- Subida de imagen para reconocimiento de carátula
- Input para análisis emocional
- Gestión de listas colaborativas
- Perfil con estadísticas

**Entregables:**
- Código fuente del frontend
- Sitio web desplegado en S3 (URL funcional)
- 2 buckets S3 configurados (web + imágenes)
- Documentación de estructura del proyecto
- Capturas de pantalla de todas las vistas
- Manual de usuario con capturas

---

### 👤 **Integrante 3: Arquitectura Serverless (Lambda + API Gateway)**

#### Responsabilidades:

**1. AWS Lambda - 6 Funciones Obligatorias**

**Función 1: Cargar Fotos a S3**
- Recibe imagen en base64 desde el frontend
- Valida formato y tamaño (máx 5MB)
- Genera nombre único para el archivo
- Sube imagen al bucket S3 de imágenes
- Retorna URL pública de la imagen
- Lenguaje: Python o Node.js

**Función 2: Reconocimiento de Carátulas**
- Recibe imagen subida por el usuario
- Llama a Rekognition (coordinación con Integrante 4)
- Detecta texto en la imagen (título de película)
- Busca película en la base de datos
- Retorna información de la película identificada
- Maneja casos donde no se identifica

**Función 3: Análisis de Emociones en Reseñas**
- Recibe texto de reseña
- Llama a Comprehend (coordinación con Integrante 4)
- Analiza sentimiento (positivo, negativo, neutral)
- Extrae emociones (alegría, tristeza, enojo, etc.)
- Almacena resultados en base de datos
- Retorna emociones detectadas

**Función 4: Traducir Reseñas**
- Recibe texto de reseña e idioma destino
- Llama a Translate (coordinación con Integrante 4)
- Traduce texto al idioma solicitado
- Cachea traducciones comunes (opcional)
- Retorna texto traducido

**Función 5: Generar Audio de Reseñas**
- Recibe texto de reseña e idioma
- Llama a Polly (coordinación con Integrante 4)
- Genera audio en formato MP3
- Almacena audio temporalmente en S3 (opcional)
- Retorna URL del audio o stream

**Función 6: Algoritmo de Recomendaciones**
- Recibe ID del usuario y/o emoción descrita
- Consulta historial del usuario en BD
- Analiza patrones de preferencias
- Compara con emociones de otros usuarios
- Implementa lógica de recomendación:
  - Por géneros favoritos
  - Por emociones similares
  - Por calificaciones altas de usuarios similares
- Retorna lista de 5-10 películas recomendadas con justificación

**2. AWS API Gateway**
- Crear API REST en API Gateway
- Configurar rutas para cada función Lambda:
  - POST `/upload-photo`
  - POST `/recognize-poster`
  - POST `/analyze-emotion`
  - POST `/translate-review`
  - POST `/text-to-speech`
  - POST `/recommendations`
- Configurar CORS para permitir llamadas desde S3
- Configurar métodos HTTP apropiados
- Habilitar API Keys o autenticación (opcional)
- Configurar throttling y rate limiting
- Desplegar API y obtener URL base

**3. Integración y Coordinación**
- Coordinar con Integrante 1 para acceso a base de datos
- Coordinar con Integrante 2 para consumo desde frontend
- Coordinar con Integrante 4 para uso de servicios de IA
- Crear políticas IAM para que Lambda acceda a:
  - S3 (lectura/escritura)
  - RDS/DynamoDB (lectura/escritura)
  - Servicios de IA (según configuración del Integrante 4)

**4. Testing y Documentación**
- Probar cada función Lambda individualmente
- Probar endpoints de API Gateway con Postman
- Documentar cada endpoint:
  - Método HTTP
  - Parámetros de entrada
  - Formato de respuesta
  - Códigos de error
- Manejar errores y excepciones apropiadamente

**Entregables:**
- 6 funciones Lambda desplegadas y funcionando
- API Gateway configurado con todas las rutas
- Documentación completa de APIs
- Código fuente de cada función
- Capturas de configuraciones
- Archivo Postman con ejemplos de requests

---

### 👤 **Integrante 4: Servicios de Inteligencia Artificial**

#### Responsabilidades:

**1. Amazon Rekognition - Reconocimiento de Carátulas**
- Configurar servicio Rekognition en AWS
- Crear políticas IAM para acceso
- Investigar y documentar:
  - DetectText: Para detectar texto en carátulas
  - DetectLabels: Para identificar elementos visuales
- Implementar lógica de identificación:
  - Extraer título de la película del texto detectado
  - Comparar con base de datos de películas
- Manejar casos de error (imagen no clara, sin texto)
- Probar con diferentes tipos de carátulas
- Coordinar con Integrante 3 para integración en Lambda

**2. Amazon Comprehend - Análisis de Sentimientos**
- Configurar servicio Comprehend
- Crear políticas IAM necesarias
- Investigar y documentar:
  - DetectSentiment: Análisis de sentimiento general
  - DetectEntities: Extracción de entidades (opcional)
  - DetectKeyPhrases: Frases clave (opcional)
- Implementar análisis de reseñas:
  - Detectar sentimiento (positivo, negativo, neutral, mixto)
  - Extraer score de confianza
  - Mapear a emociones específicas (feliz, triste, emocionado, etc.)
- Probar con diferentes tipos de reseñas
- Coordinar con Integrante 3 para integración

**3. Amazon Translate - Traducción de Reseñas**
- Configurar servicio Translate
- Crear políticas IAM necesarias
- Configurar soporte para al menos 5 idiomas:
  - Español (es)
  - Inglés (en)
  - Francés (fr)
  - Alemán (de)
  - Italiano (it)
- Implementar detección automática de idioma
- Implementar traducción entre idiomas
- Manejar textos largos (segmentación si es necesario)
- Probar traducciones de calidad
- Coordinar con Integrante 3 para integración

**4. Amazon Polly - Text-to-Speech**
- Configurar servicio Polly
- Crear políticas IAM necesarias
- Investigar voces disponibles por idioma:
  - Voces en español (Lucia, Conchita, etc.)
  - Voces en inglés (Joanna, Matthew, etc.)
  - Voces en otros idiomas
- Implementar conversión de texto a audio:
  - Sintetizar speech en formato MP3
  - Configurar velocidad de lectura
  - Manejar textos largos (dividir en chunks si es necesario)
- Probar calidad de audio generado
- Coordinar con Integrante 3 para integración

**5. Servicio Extra (Elegir uno)**

**Opción A: Amazon CloudWatch (Recomendado)**
- Configurar monitoreo de toda la aplicación
- Crear dashboards con métricas:
  - Uso de Lambda (invocaciones, errores, duración)
  - Uso de EC2 (CPU, memoria, red)
  - Uso de RDS (conexiones, queries)
  - Costos estimados por servicio
- Configurar alarmas:
  - Alta latencia en APIs
  - Errores en funciones Lambda
  - Costos excediendo presupuesto
- Crear logs centralizados
- Documentar métricas importantes

**Opción B: Amazon SES**
- Configurar servicio de email
- Verificar dominio o email
- Implementar envío de notificaciones:
  - Email de bienvenida al registrarse
  - Notificación cuando alguien agrega a lista colaborativa
  - Recordatorios de películas pendientes
- Crear templates de emails
- Coordinar con backend para triggers

**Opción C: Amazon ElastiCache**
- Configurar Redis o Memcached
- Implementar caché para:
  - Traducciones comunes
  - Consultas frecuentes de películas
  - Sesiones de usuario
- Reducir llamadas a base de datos
- Mejorar rendimiento general

**6. Documentación y Capacitación**
- Crear documento con toda la investigación de servicios IA
- Explicar cómo funciona cada servicio
- Documentar costos de cada servicio
- Crear ejemplos de uso
- Capacitar al equipo sobre cómo usar los servicios
- Proporcionar código de ejemplo para integraciones

**7. Testing de Servicios de IA**
- Crear dataset de prueba:
  - 10-20 carátulas de películas conocidas
  - 10-20 reseñas de ejemplo en diferentes idiomas
  - Textos con diferentes sentimientos
- Probar cada servicio individualmente
- Documentar precisión y resultados
- Ajustar configuraciones según resultados

**Entregables:**
- Servicios de IA configurados y funcionando
- Políticas IAM documentadas
- Manual técnico de cada servicio:
  - Qué es
  - Cómo funciona
  - Cómo se integra
  - Costos aproximados
- Código de ejemplo de uso
- Dataset de pruebas
- Capturas de configuraciones
- Resultados de pruebas (screenshots de consola AWS)

---

## Coordinación del Equipo

### 🗓️ Cronograma Sugerido

**Semana 1 (Oct 21-27):**
- Día 1-2: Configuración de cuenta AWS, usuarios IAM, repositorio GitHub
- Día 3-4: Integrante 1 crea BD y primera instancia EC2
- Día 3-4: Integrante 2 diseña mockups del frontend
- Día 3-4: Integrante 3 investiga Lambda y API Gateway
- Día 3-4: Integrante 4 investiga servicios de IA
- Día 5-7: Primera reunión de sincronización, definir interfaces/contratos

**Semana 2 (Oct 28 - Nov 3):**
- Día 1-3: Integrante 1 completa backend y load balancer
- Día 1-3: Integrante 2 desarrolla frontend básico
- Día 1-3: Integrante 3 crea primeras 3 funciones Lambda
- Día 1-3: Integrante 4 configura servicios de IA
- Día 4-5: Integrante 3 completa las 6 funciones y API Gateway
- Día 4-5: Integrante 4 prueba servicios de IA
- Día 6-7: Integración frontend-backend-lambda
- Día 6-7: Testing general, corrección de bugs

**Semana 3 (Nov 4):**
- Día 1: Testing final, ajustes
- Día 1: Completar manual técnico
- Día 1: Capturas de pantalla de todos los servicios
- Día 1: Preparar presentación
- Día 1: Entrega del proyecto


### 🔗 Dependencias entre Integrantes

```
Integrante 1 (Backend/BD) 
    ↓
    → Proporciona estructura de BD a todos
    → Proporciona endpoints de API a Integrante 2 y 3
    
Integrante 2 (Frontend)
    ↓
    → Consume APIs de Integrante 1 y 3
    → Coordina con Integrante 3 para buckets S3
    
Integrante 3 (Serverless)
    ↓
    → Usa servicios de IA del Integrante 4
    → Accede a BD del Integrante 1
    → Proporciona APIs a Integrante 2
    → Usa buckets S3 del Integrante 2
    
Integrante 4 (IA)
    ↓
    → Configura servicios para Integrante 3
    → Documenta para todos
    → Monitorea aplicación completa
```

### 📞 Reuniones de Sincronización

**Reunión 1 (Día 2-3):**
- Acordar estructura de base de datos
- Definir endpoints de API
- Definir formato de respuestas JSON
- Asignar nombres a buckets S3
- Definir región de AWS a usar

**Reunión 2 (Día 7):**
- Revisar avances
- Resolver problemas de integración
- Ajustar endpoints si es necesario
- Probar conexiones entre servicios

**Reunión 3 (Día 12-13):**
- Testing integral
- Revisión de funcionalidades
- División de trabajo para manual técnico
- Preparación de presentación

### 📝 Documentación en GitHub

**Estructura del Repositorio:**
```
Semi1-SeccionA-2S2025-Grupo#-Practica2/
│
├── README.md (Manual Técnico principal)
├── frontend/
│   ├── src/
│   ├── public/
│   └── README.md (Documentación del frontend)
│
├── backend/
│   ├── api1/
│   ├── api2/
│   ├── database/
│   │   └── schema.sql
│   └── README.md (Documentación del backend)
│
├── lambda-functions/
│   ├── upload-photo/
│   ├── recognize-poster/
│   ├── analyze-emotion/
│   ├── translate-review/
│   ├── text-to-speech/
│   ├── recommendations/
│   └── README.md (Documentación de funciones)
│
├── docs/
│   ├── arquitectura.png
│   ├── manual-usuario.md
│   ├── api-documentation.md
│   └── capturas/
│       ├── s3/
│       ├── ec2/
│       ├── lambda/
│       ├── rds/
│       └── ia-services/
│
└── scripts/
    └── deploy.sh (opcional)
```

---

## Resumen de Responsabilidades

| Integrante | Servicios AWS | Funcionalidades | Estimado de Horas |
|------------|---------------|-----------------|-------------------|
| **1** | EC2, RDS, Load Balancer | Backend API, Base de datos, Alta disponibilidad | 25-30 hrs |
| **2** | S3 (2 buckets) | Frontend completo, UI/UX, Integración | 25-30 hrs |
| **3** | Lambda (6), API Gateway | 6 funciones serverless, APIs REST | 25-30 hrs |
| **4** | Rekognition, Comprehend, Translate, Polly, +1 extra | Configuración IA, Testing, Documentación | 25-30 hrs |
