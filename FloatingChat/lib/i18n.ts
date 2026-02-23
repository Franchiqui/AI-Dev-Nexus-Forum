export interface Translations {
  // Authentication
  auth: {
    passwordTooShort(passwordTooShort: any): unknown;
    welcome: string;
    signInDescription: string;
    login: string;
    register: string;
    email: string;
    password: string;
    username: string;
    enterEmail: string;
    enterPassword: string;
    chooseUsername: string;
    createPassword: string;
    signingIn: string;
    signIn: string;
    creatingAccount: string;
    createAccount: string;
    termsText: string;
    loginFailed: string;
    registrationFailed: string;
    confirmPassword: string;
    passwordsDontMatch: string;
  };

  // Chat
  chat: {
    title: string;
    welcome: string;
    realTimeChat: string;
    logout: string;
    noMessages: string;
    noMessagesDescription: string;
    typeMessage: string;
    audioMessage: string;
    recording: string;
    recordingDescription: string;
    minimize: string;
    maximize: string;
    closeChat: string;
    openChat: string;
    onlineUsers: string;
    connectedUsers: string;
    online: string;
    offline: string;
    onlineStatus: string;
    backToGeneral: string;
    chatWith: string;
    back: string;
    lastSeen: string;
  };

  // Common
  common: {
    back: string | undefined;
    loading: string;
    error: string;
    retry: string;
    cancel: string;
    save: string;
    delete: string;
    edit: string;
    send: string;
    name: string;
    fullName: string;
    phone: string;
    phoneNumber: string;
    address: string;
  };

  // Demo page
  demo: {
    title: string;
    subtitle: string;
    instructions: string;
    instruction1: string;
    instruction2: string;
    instruction3: string;
    instruction4: string;
    instruction5: string;
  };
}

export const translations: Record<string, Translations> = {
  es: {
    auth: {
      welcome: "Bienvenido al Chat",
      signInDescription: "Inicia sesión o crea una cuenta para comenzar a chatear",
      login: "Iniciar Sesión",
      register: "Registrarse",
      email: "Correo Electrónico",
      password: "Contraseña",
      username: "Nombre de Usuario",
      enterEmail: "Ingresa tu correo electrónico",
      enterPassword: "Ingresa tu contraseña",
      chooseUsername: "Elige un nombre de usuario",
      createPassword: "Crea una contraseña",
      signingIn: "Iniciando sesión...",
      signIn: "Iniciar Sesión",
      creatingAccount: "Creando cuenta...",
      createAccount: "Crear Cuenta",
      termsText: "Al usar este chat, aceptas nuestros términos de servicio y política de privacidad.",
      loginFailed: "Error al iniciar sesión",
      registrationFailed: "Error al registrarse",
      confirmPassword: "Confirmar Contraseña",
      passwordsDontMatch: "Las contraseñas no coinciden",
      passwordTooShort: function (passwordTooShort: any): unknown {
        throw new Error("Function not implemented.");
      }
    },
    chat: {
      title: "Chat",
      welcome: "Bienvenido",
      realTimeChat: "Chat en tiempo real",
      logout: "Cerrar sesión",
      noMessages: "Sin mensajes",
      noMessagesDescription: "Envía un mensaje para comenzar la conversación",
      typeMessage: "Escribe un mensaje...",
      audioMessage: "Mensaje de audio",
      recording: "Grabando...",
      recordingDescription: "Suelta para enviar, desliza para cancelar",
      minimize: "Minimizar",
      maximize: "Maximizar",
      closeChat: "Cerrar chat",
      openChat: "Abrir chat",
      onlineUsers: "Usuarios en línea",
      connectedUsers: "Usuarios conectados",
      online: "En línea",
      offline: "Desconectado",
      onlineStatus: "Estado en línea",
      backToGeneral: "Volver al chat general",
      chatWith: "Chat con",
      back: "Atrás",
      lastSeen: "Visto por última vez",
    },
    common: {
      loading: "Cargando...",
      error: "Error",
      retry: "Reintentar",
      cancel: "Cancelar",
      save: "Guardar",
      delete: "Eliminar",
      edit: "Editar",
      send: "Enviar",
      name: "Nombre",
      fullName: "Nombre completo",
      phone: "Teléfono",
      phoneNumber: "Número de teléfono",
      address: "Dirección",
      back: undefined
    },
    demo: {
      title: "Aplicación de Chat Flotante",
      subtitle: "Una aplicación de chat moderna y redimensionable con mensajería en tiempo real",
      instructions: "Instrucciones de Demostración",
      instruction1: "• La ventana de chat aparecerá como una superposición flotante",
      instruction2: "• Arrastra desde las esquinas para redimensionar la ventana",
      instruction3: "• Arrastra desde el encabezado para mover la ventana",
      instruction4: "• Soporta mensajes de texto, audio e imágenes",
      instruction5: "• Regístrate o inicia sesión para comenzar a chatear"
    }
  },
  en: {
    auth: {
      welcome: "Welcome to Chat",
      signInDescription: "Sign in or create an account to start chatting",
      login: "Login",
      register: "Register",
      email: "Email",
      password: "Password",
      username: "Username",
      enterEmail: "Enter your email",
      enterPassword: "Enter your password",
      chooseUsername: "Choose a username",
      createPassword: "Create a password",
      signingIn: "Signing in...",
      signIn: "Sign In",
      creatingAccount: "Creating account...",
      createAccount: "Create Account",
      termsText: "By using this chat, you agree to our terms of service and privacy policy.",
      loginFailed: "Login failed",
      registrationFailed: "Registration failed",
      confirmPassword: "Confirm Password",
      passwordsDontMatch: "Passwords don't match",
      passwordTooShort: function (passwordTooShort: any): unknown {
        throw new Error("Function not implemented.");
      }
    },
    chat: {
      title: "Chat",
      welcome: "Welcome",
      realTimeChat: "Real-time chat",
      logout: "Logout",
      noMessages: "No messages",
      noMessagesDescription: "Send a message to start the conversation",
      typeMessage: "Type a message...",
      audioMessage: "Audio message",
      recording: "Recording...",
      recordingDescription: "Release to send, swipe to cancel",
      minimize: "Minimize",
      maximize: "Maximize",
      closeChat: "Close chat",
      openChat: "Open chat",
      onlineUsers: "Online users",
      connectedUsers: "Connected users",
      online: "Online",
      offline: "Offline",
      onlineStatus: "Online status",
      backToGeneral: "Back to general chat",
      chatWith: "Chat with",
      back: "Back",
      lastSeen: "Last seen",
    },
    common: {
      loading: "Loading...",
      error: "Error",
      retry: "Retry",
      cancel: "Cancel",
      save: "Save",
      delete: "Delete",
      edit: "Edit",
      send: "Send",
      name: "Name",
      fullName: "Full Name",
      phone: "Phone",
      phoneNumber: "Phone Number",
      address: "Address",
      back: undefined
    },
    demo: {
      title: "Floating Chat Application",
      subtitle: "A modern, resizable chat application with real-time messaging",
      instructions: "Demo Instructions",
      instruction1: "• The chat window will appear as a floating overlay",
      instruction2: "• Drag from the corners to resize the window",
      instruction3: "• Drag from the header to move the window",
      instruction4: "• Supports text, audio, and image messages",
      instruction5: "• Register or login to start chatting"
    }
  }
};

export const defaultLanguage = 'es';

export function getTranslations(language: string = defaultLanguage): Translations {
  return translations[language] || translations[defaultLanguage];
}
