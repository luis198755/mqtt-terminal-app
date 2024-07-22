# MQTT Manager

## Descripción
MQTT Manager es una aplicación web interactiva construida con React que permite a los usuarios conectarse a brokers MQTT, suscribirse a tópicos, enviar y recibir mensajes, y visualizar datos en tiempo real. La aplicación presenta una interfaz de usuario intuitiva con un diseño inspirado en terminales, ofreciendo una experiencia familiar para usuarios técnicos y una funcionalidad avanzada para trabajar con mensajes MQTT.

## Características principales
- Conexión configurable a brokers MQTT, incluyendo soporte para conexiones seguras (SSL/TLS)
- Suscripción y gestión de múltiples tópicos
- Envío y recepción de mensajes MQTT en tiempo real
- Editor avanzado de payload con soporte para JSON y validación en tiempo real
- Visualización gráfica de datos numéricos recibidos
- Interfaz responsiva y adaptable a diferentes tamaños de pantalla
- Diseño minimalista para una experiencia de usuario optimizada

## Requisitos previos
- Node.js (versión 12.0 o superior)
- npm (normalmente viene con Node.js)

## Instalación

1. Clona el repositorio:
   ```
   git clone https://github.com/tu-usuario/mqtt-manager.git
   cd mqtt-manager
   ```

2. Instala las dependencias:
   ```
   npm install
   ```

3. Inicia la aplicación en modo desarrollo:
   ```
   npm start
   ```

4. Abre tu navegador y visita `http://localhost:3000`

## Uso

1. **Configuración de la conexión MQTT:**
   - Ingresa los detalles del broker MQTT en los campos correspondientes.
   - Activa la opción SSL/TLS si es necesario y proporciona los certificados requeridos.
   - Haz clic en "Connect" para establecer la conexión.

2. **Gestión de tópicos:**
   - Usa el panel lateral para ver los tópicos suscritos.
   - Ingresa un nuevo tópico en el campo de texto y haz clic en "Subscribe" para añadirlo.

3. **Envío de mensajes:**
   - Selecciona un tópico de la lista.
   - Elige entre payload de texto simple o JSON usando el selector.
   - Para texto simple: Escribe tu mensaje y presiona Enter para enviar.
   - Para JSON: Usa el editor avanzado, escribe o pega tu JSON, y presiona Ctrl+Enter (o Cmd+Enter en Mac) para enviar.

4. **Visualización de mensajes:**
   - Los mensajes recibidos y enviados se muestran en el área central.
   - El log de mensajes se desplaza automáticamente para mostrar los mensajes más recientes.

5. **Gráfica de datos:**
   - La gráfica muestra los últimos valores numéricos recibidos para el tópico seleccionado.
   - La gráfica se oculta automáticamente cuando se utiliza el editor JSON para maximizar el espacio de trabajo.

6. **Desconexión:**
   - Haz clic en "Disconnect" para cerrar la conexión con el broker MQTT.

## Estructura del proyecto

```
mqtt-manager/
│
├── src/
│   ├── components/
│   │   ├── StatusBar.js
│   │   ├── Sidebar.js
│   │   ├── MessageLog.js
│   │   ├── InputBar.js
│   │   ├── AdvancedPayloadEditor.js
│   │   ├── MQTTConfig.js
│   │   └── MessageGraph.js
│   │
│   ├── MQTTManager.js
│   ├── App.js
│   └── index.js
│
├── public/
│   └── index.html
│
├── package.json
└── README.md
```

## Diagrama de flujo

El siguiente diagrama muestra el flujo básico de la aplicación MQTT Manager:

```mermaid
graph TD
    A[Inicio] --> B[Configurar conexión MQTT]
    B --> C{Conectar}
    C -->|Éxito| D[Suscribirse a tópicos]
    C -->|Fallo| B
    D --> E[Esperar eventos]
    E --> F{Tipo de evento}
    F -->|Nuevo mensaje| G[Mostrar en log y actualizar gráfica]
    F -->|Enviar mensaje| H[Validar payload]
    H -->|Válido| I[Publicar mensaje MQTT]
    H -->|Inválido| J[Mostrar error]
    F -->|Nuevo tópico| K[Suscribirse a nuevo tópico]
    F -->|Cambiar tipo de payload| L[Alternar editor JSON/texto]
    F -->|Desconectar| M[Cerrar conexión MQTT]
    G --> E
    I --> E
    J --> E
    K --> E
    L --> E
    M --> B
```

## Características avanzadas

### Editor de payload JSON
- Editor de código integrado con resaltado de sintaxis.
- Validación de JSON en tiempo real.
- Envío de mensajes JSON con Ctrl+Enter (Cmd+Enter en Mac).

### Conexiones seguras
- Soporte para conexiones MQTT sobre SSL/TLS.
- Capacidad de cargar certificados CA, certificados de cliente y claves privadas.

### Interfaz adaptativa
- La gráfica se oculta automáticamente al usar el editor JSON para optimizar el espacio.
- Diseño responsivo que se adapta a diferentes tamaños de pantalla.

## Contribuciones
Las contribuciones son bienvenidas. Por favor, abre un issue para discutir cambios mayores antes de crear un pull request.

## Licencia
Este proyecto está licenciado bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.