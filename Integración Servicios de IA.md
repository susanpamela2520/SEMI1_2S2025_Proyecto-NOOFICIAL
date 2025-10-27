# Documentación de Integración: API de IA (CineMatch)

¡Hola equipo\! Aquí está la documentación para usar los 4 servicios de Inteligencia Artificial. Todos los *endpoints* se invocan con el método `POST` y usan JSON.

**URL Base de la API:** `https://up4sbcn60d.execute-api.us-east-1.amazonaws.com/COMPYTRANSLATE`

*(Nota: La URL completa de cada servicio es la URL Base + la Ruta del Endpoint)*

-----

### 1\. Servicio de Análisis de Emociones (Comprehend)

  - **Descripción:** Recibe un texto (la reseña) y devuelve el sentimiento principal.
  - **Endpoint:** `POST /CineMatch-Analizar-Emocion`
  - **JSON de Envío (Request Body):**
    ```json
    {
      "texto": "Me encantó la película, me hizo llorar de felicidad."
    }
    ```
  - **Respuesta Exitosa (JSON):**
    ```json
    {
      "sentimientoDetectado": "POSITIVE",
      "puntajes": {
        "Positive": 0.98,
        "Negative": 0.00,
        "Neutral": 0.01,
        "Mixed": 0.01
      }
    }
    ```
  -- **URL Completa del Servicio:** `https://up4sbcn60d.execute-api.us-east-1.amazonaws.com/COMPYTRANSLATE/CineMatch-Analizar-Emocion`

-----

### 2\. Servicio de Traducción de Reseñas (Translate)

  - **Descripción:** Traduce un texto de un idioma de origen a uno de destino.
  - **Endpoint:** `POST /traducir-resena` *(VouPi, porfa confirma que esta es la ruta que creaste)*
  - **JSON de Envío (Request Body):**
    ```json
    {
      "texto": "This movie is amazing and I recommend it to everyone.",
      "origen": "en",
      "destino": "es"
    }
    ```
  - **Respuesta Exitosa (JSON):**
    ```json
    {
      "traduccion": "Esta película es increíble y se la recomiendo a todo el mundo."
    }
    ```
  -- **URL Completa del Servicio:** `https://up4sbcn60d.execute-api.us-east-1.amazonaws.com/COMPYTRANSLATE/traducir-resena`

-----

### 3\. Servicio de Lectura de Reseñas (Polly)

  - **Descripción:** Convierte un texto a voz (en español). Devuelve un archivo de audio MP3 codificado en Base64.
  - **Endpoint:** `POST /generar-audio`
  - **JSON de Envío (Request Body):**
    ```json
    {
      "texto": "Hola, estoy probando el servicio de voz de CineMatch.",
      "voz": "Mia"
    }
    ```
  - **Respuesta Exitosa (JSON):**
    ```json
    {
      "audioBase64": "SUQzBAAAAAAAI1RTU0UAAAADASs... (texto larguísimo)...",
      "formato": "mp3"
    }
    ```
  - **Para el Frontend (JavaScript):** Así pueden reproducir el audio que reciben:
    ```javascript
    // 'respuesta' es el JSON que reciben de la API
    const audioSrc = "data:audio/mp3;base64," + respuesta.audioBase64;
    const audio = new Audio(audioSrc);
    audio.play();
    ```
  - **URL Completa del Servicio:** `https://up4sbcn60d.execute-api.us-east-1.amazonaws.com/COMPYTRANSLATE/generar-audio`

-----

### 4\. Servicio de Reconocimiento de Carátulas (Rekognition)

  - **Descripción:** Recibe una imagen (póster/carátula) codificada en Base64 y devuelve el texto que lee en ella (ej. el título).
  - **Endpoint:** `POST /reconocer-caratula` *(VouPi, porfa confirma que esta es la ruta que creaste)*
  - **JSON de Envío (Request Body):**
    ```json
    {
      "imagenBase64": "iVBORw0KGgoAAAAN... (texto larguísimo de la imagen)..."
    }
    ```
  - **Para el Frontend (JavaScript):** Para obtener este texto Base64, deben leerlo desde un `<input type="file">` usando un `FileReader` y el método `readAsDataURL()`.
  - **Respuesta Exitosa (JSON):**
    ```json
    {
      "textoDetectado": [
        {
          "texto": "INCEPTION",
          "confianza": 99.8
        },
        {
          "texto": "LEONARDO DICAPRIO",
          "confianza": 98.2
        }
      ]
    }
    ```
    - **URL Completa del Servicio:** `https://up4sbcn60d.execute-api.us-east-1.amazonaws.com/COMPYTRANSLATE/reconocer-caratula`

-----

**Nota Final:** Todas las APIs tienen CORS (`Access-Control-Allow-Origin: *`) habilitado, así que el Frontend podrá llamarlas desde el navegador sin problemas.