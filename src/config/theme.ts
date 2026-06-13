// Configuración centralizada de temas, colores y marca

export const BRAND_CONFIG = {
  name: "Lions Cars",
  tagline: "Tu confianza en ruedas",
  logo: "/hero/logo.png",
  website: "https://lionscars.cl",
  contact: {
    phone: "+56900000000",
    email: "info@lionscars.cl",
    address: "Puerto Varas, Chile"
  }
};

export const COLOR_PALETTE = {
  // Colores principales de la marca (extraídos del logo)
  primary: {
    gold: "#C9A84C",         // Dorado principal del logo
    goldBright: "#E8C96A",   // Dorado brillante / highlights
    goldDark: "#A07830",     // Dorado oscuro / sombras
    light: "#F5E9CC"         // Dorado muy claro / fondo suave
  },
  secondary: {
    red: "#9B2020",          // Rojo borgoña de la melena
    redDark: "#6B1010",      // Rojo oscuro / profundidad
    black: "#0A0A0A",        // Negro del fondo del logo
    charcoal: "#1A1A1A"      // Negro suavizado para fondos UI
  },
  // Estados y funcionalidad
  status: {
    success: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444",
    info: "#3B82F6"
  },
  // Escala de grises
  gray: {
    50: "#F9FAFB",
    100: "#F3F4F6",
    200: "#E5E7EB",
    300: "#D1D5DB",
    400: "#9CA3AF",
    500: "#6B7280",
    600: "#4B5563",
    700: "#374151",
    800: "#1F2937",
    900: "#111827"
  }
};

export const THEME = {
  light: {
    bg: {
      primary: "#FFFFFF",
      secondary: "#F9F6F0",   // Crema cálida, acorde al dorado
      tertiary: "#F0EAD6"     // Dorado muy suave
    },
    text: {
      primary: "#0A0A0A",
      secondary: "#4B3A1A",   // Café dorado oscuro
      tertiary: "#9CA3AF"
    },
    border: "#D4B86A"         // Borde dorado suave
  },
  dark: {
    bg: {
      primary: "#0A0A0A",     // Negro del logo
      secondary: "#1A1A1A",   // Charcoal
      tertiary: "#2A2A2A"     // Gris muy oscuro
    },
    text: {
      primary: "#E8C96A",     // Dorado brillante sobre negro
      secondary: "#C9A84C",   // Dorado principal
      tertiary: "#9CA3AF"
    },
    border: "#3A2A0A"         // Borde oscuro con tinte dorado
  }
};

// Variantes de animación
export const ANIMATIONS = {
  fast: "0.15s",
  normal: "0.3s",
  slow: "0.5s"
};

// Breakpoints responsive
export const BREAKPOINTS = {
  mobile: "640px",
  tablet: "768px",
  laptop: "1024px",
  desktop: "1280px"
};

// Función helper para obtener color por nombre
export const getColor = (colorPath: string): string => {
  const keys = colorPath.split(".");
  let value: any = COLOR_PALETTE;

  for (const key of keys) {
    value = value[key];
    if (value === undefined) {
      console.warn(`Color no encontrado: ${colorPath}`);
      return "#000000";
    }
  }

  return value;
};