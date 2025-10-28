# Laboratorio Seminario de Sistemas 1
# Grupo 4 - Manual Técnico

## 1. Miembros del grupo

| Carné      | Nombre completo                      |
|------------|--------------------------------------|
| 201801391  | Luis Fernando Gomez Rendon           |
| 201700753  | Carlos Eduardo Carrera Aguilar       |
| 201612218  | Susan Pamela Herrera                 |
| 201906099  | Daniel Moisés Chan Pelico            |

## 2. Objetivos del proyecto

El objetivo principal del proyecto es diseñar e implementar una arquitectura escalable y distribuida en AWS que permita gestionar de forma eficiente un sistema de usuarios y películas, integrando análisis automatizado de reseñas, reconocimiento de imágenes y servicios de traducción y voz.

De forma específica, el proyecto busca:

- Optimizar el acceso y la entrega de contenido a los usuarios mediante el uso de Amazon CloudFront y un sitio web estático alojado en Amazon S3, garantizando baja latencia y alta disponibilidad.

- Implementar un backend distribuido con Elastic Load Balancer y dos instancias EC2 conectadas a una base de datos MySQL en Amazon RDS, para almacenar información de usuarios, películas, reseñas, películas vistas y favoritas.

- Incorporar inteligencia artificial y automatización a través de AWS Lambda, permitiendo la integración con servicios cognitivos como Rekognition, Polly, Comprehend y Translate para el análisis multimedia y de texto.

- Facilitar la gestión de archivos multimedia, permitiendo que los usuarios suban imágenes de perfil y portadas de películas directamente a Amazon S3 mediante funciones Lambda.

En conjunto, estos objetivos buscan demostrar una solución moderna basada en la nube que combine rendimiento, escalabilidad, inteligencia artificial y experiencia de usuario mejorada.

## 3. Descripción del proyecto
El proyecto consiste en el desarrollo de una plataforma web alojada completamente en la nube de AWS, diseñada para la gestión y análisis de contenido cinematográfico generado por usuarios.

El sistema se estructura en varias capas conectadas entre sí:

1. Capa de acceso (Frontend):
El usuario interactúa con la aplicación a través de un sitio web estático distribuido por Amazon CloudFront, cuyo contenido se encuentra hospedado en un bucket de Amazon S3. Esta configuración permite una entrega rápida del frontend y una experiencia fluida a nivel global.

2. Capa de aplicación (Backend):
Las solicitudes del frontend son procesadas mediante un Elastic Load Balancer, que distribuye el tráfico entre dos instancias EC2 responsables de manejar la lógica de negocio principal.
Ambas instancias se conectan a una base de datos MySQL en Amazon RDS, donde se almacenan los datos de usuarios, películas, películas vistas, favoritas y las reseñas realizadas.

3. Capa de servicios inteligentes (Serverless):
Paralelamente, el frontend también se comunica con API Gateway, que actúa como punto de entrada para las solicitudes dirigidas a funciones AWS Lambda.
Estas funciones permiten integrar servicios de inteligencia artificial:

    - Amazon Rekognition: identifica portadas de películas mediante reconocimiento de imágenes.

    - Amazon Polly: convierte las reseñas escritas por usuarios en voz, ofreciendo accesibilidad y dinamismo.

    - Amazon Comprehend: analiza el sentimiento expresado en las reseñas (positivo, negativo o neutro).

    - Amazon Translate: traduce reseñas a diferentes idiomas para usuarios internacionales.

    - Funciones adicionales Lambda: permiten subir imágenes de perfil y portadas al bucket S3.

En conjunto, esta arquitectura aprovecha los servicios gestionados de AWS para ofrecer una plataforma altamente escalable, inteligente, segura y con tiempos de respuesta optimizados, orientada a la experiencia del usuario y al análisis automatizado de contenido.

## 4. Arquitectura implementada

![Arquitectura](img/Arquitectura.png)

## 5. Presupuesto del proyecto
El presupuesto del proyecto se realiza utilizando la herramienta AWS Pricing Calculator. Ver presupuesto detallado [Presupuesto](https://calculator.aws/#/estimate?id=49cc2c6c5e3d9228004a82932d301c04b2540c8d)

![Estimado](img/Estimado.PNG)

## 6. Servicios utilzados
### 6.1 Amazon EC2 (Elastic Compute Cloud)
Descripción:
Amazon EC2 es un servicio que permite ejecutar máquinas virtuales (instancias) en la nube de AWS. Brinda capacidad de cómputo escalable bajo demanda, permitiendo ejecutar aplicaciones sin necesidad de comprar hardware físico.

Características principales:

- Elección de sistema operativo (Linux, Windows, etc.).
- Tipos de instancias optimizadas para CPU, memoria o almacenamiento.
- Escalado automático mediante Auto Scaling Groups.
- Integración con Amazon EBS (volúmenes persistentes).
- Facturación por uso (“pago por hora o segundo”).

Casos de uso:

- Servidores web y de aplicaciones.
- Entornos de desarrollo o pruebas.
- Procesamiento de grandes volúmenes de datos.
- Ejecución de contenedores o microservicios.

Ventajas:

- Alta disponibilidad y escalabilidad.
- Integración con otros servicios AWS.

### 6.2 Amazon Load Balancer (Elastic Load Balancing – ELB)
Descripción:
Distribuye automáticamente el tráfico entrante entre múltiples instancias de EC2, contenedores u otros destinos, mejorando la disponibilidad y tolerancia a fallos.

Tipos de Load Balancer:

- ALB (Application Load Balancer): para tráfico HTTP/HTTPS.
- NLB (Network Load Balancer): para tráfico TCP/UDP de alto rendimiento.
- GLB (Gateway Load Balancer): para servicios de red como firewalls o proxies.

Casos de uso:

- Balanceo de carga de aplicaciones web.
- Escenarios de alta disponibilidad.
- Integración con Auto Scaling.

Ventajas:

- Escalado automático.
- Monitoreo de salud de instancias.
- Distribución inteligente del tráfico.

### 6.3 Amazon S3 (Simple Storage Service)
Descripción:
Servicio de almacenamiento de objetos que permite guardar y recuperar cualquier cantidad de datos en cualquier momento. Ideal para copias de seguridad, contenido multimedia, registros o big data.

Características:

- Almacenamiento prácticamente ilimitado.
- Altamente duradero (99.999999999% de durabilidad).
- Versionado de objetos.
- Control de acceso mediante políticas IAM y buckets.

Casos de uso:

- Almacenamiento de imágenes, videos, documentos.
- Respaldos y recuperación ante desastres.
- Hosting de sitios web estáticos.
- Almacenamiento para análisis con Amazon Athena o Redshift.

Ventajas:

- Escalabilidad automática.
- Seguridad y cifrado integrados.
- Bajo costo por GB almacenado.

### 6.4 Amazon Translate
Descripción:
Servicio de traducción automática neural que convierte texto entre múltiples idiomas con alta precisión.

Características:

- Traducción en tiempo real o por lotes.
- Soporte para más de 70 idiomas.
- Compatible con archivos y flujos de datos.

Casos de uso:

- Localización de contenido web o apps.
- Traducción de chats o correos.
- Análisis multilingüe de datos (junto con Comprehend).

Ventajas:

- Rápido y económico.
- Alta calidad de traducción con redes neuronales.
- Integración con S3, Lambda y otros servicios.

### 6.5 Amazon Polly
Descripción:
Convierte texto en voz realista mediante tecnologías de text-to-speech (TTS).

Características:

- Más de 30 idiomas y más de 60 voces.
- Soporte para Speech Marks (pausas, emociones, etc.).
- Exportación en formatos MP3 u OGG.

Casos de uso:

- Lectura automática de artículos o libros.
- Asistentes virtuales.
- Aplicaciones inclusivas (accesibilidad).

Ventajas:

- Voces naturales y personalizables.
- Generación bajo demanda o por lotes.
- Escalable y de bajo costo.

### 6.6 Amazon Comprehend
Descripción:
Servicio de procesamiento de lenguaje natural (NLP) que usa machine learning para analizar texto y extraer significado.

Características:

- Detección de sentimientos (positivo, negativo, neutro).
- Extracción de entidades (personas, lugares, organizaciones).
- Clasificación de temas y frases clave.
- Análisis multilingüe.

Casos de uso:

- Análisis de opiniones en redes sociales.
- Detección de entidades en documentos.
- Automatización de soporte al cliente.

Ventajas:

- No requiere entrenar modelos manualmente.
- Compatible con datos en S3 y bases de datos AWS.
- Escalable y personalizable.

### 6.7 Amazon Rekognition
Descripción:
Servicio de visión artificial que analiza imágenes y videos usando redes neuronales profundas.

Características:

- Detección de rostros, objetos, textos o escenas.
- Comparación y reconocimiento facial.
- Moderación de contenido.
- Análisis de video en tiempo real.

Casos de uso:

- Sistemas de seguridad.
- Catalogación automática de imágenes.
- Filtrado de contenido inapropiado.

Ventajas:

- Precisión alta sin necesidad de entrenar modelos.
- Integración con S3, Lambda y Kinesis Video Streams.
- Escalabilidad y análisis en tiempo real.

### 6.8 Amazon Api Gateway
Descripción:
Permite crear, publicar y gestionar APIs de forma segura y escalable. Es un punto de entrada para microservicios o backends sin servidor.

Características:

- Soporta REST, HTTP y WebSocket APIs.
- Control de acceso con IAM, Cognito o tokens personalizados.
- Límite de peticiones, caché y monitoreo integrado.

Casos de uso:

- Creación de APIs para apps móviles o web.
- Integración con AWS Lambda (arquitectura serverless).
- Proxy para microservicios.

Ventajas:

- Escalable automáticamente.
- Seguridad integrada.
- Compatible con múltiples protocolos.

### 6.9 Amazon CloudFront
Descripción:
Amazon CloudFront es un servicio de red de entrega de contenido (CDN) que distribuye datos, videos, aplicaciones y API de manera global con baja latencia y alta velocidad de transferencia. Se integra de forma nativa con otros servicios de AWS, como Amazon S3, EC2, API Gateway, Elastic Load Balancing y Lambda@Edge, lo que permite acelerar la entrega de contenido estático y dinámico a los usuarios finales.

Características:

- Red global con más de 400 puntos de presencia (Edge Locations) distribuidos en múltiples regiones.
- Compatibilidad con contenido estático y dinámico, así como transmisión de video en tiempo real (live streaming).
- Integración con AWS Shield y AWS WAF para proteger contra ataques DDoS y vulnerabilidades comunes.
- Soporte para TLS/SSL, autenticación mediante firmas, y control de acceso a contenido privado.
- Caché configurable y políticas de expiración flexibles para optimizar el rendimiento y reducir costos.

Casos de uso:

- Aceleración del acceso a sitios web y aplicaciones alojadas en Amazon S3 o servidores EC2.
- Distribución global de archivos multimedia (imágenes, videos, música, juegos).
- Optimización de APIs distribuidas a través de API Gateway.
- Transmisión de contenido en vivo o bajo demanda (video streaming).

Ventajas:

- Baja latencia: entrega del contenido desde el punto geográficamente más cercano al usuario.
- Escalabilidad automática: maneja grandes volúmenes de tráfico sin intervención manual.
- Alta seguridad: integración con servicios de protección de red de AWS.
- Reducción de costos: disminuye la carga de los servidores de origen y el consumo de ancho de banda.
- Integración perfecta: funciona en conjunto con S3, Load Balancer, EC2 y Lambda para ofrecer una arquitectura moderna y eficiente.