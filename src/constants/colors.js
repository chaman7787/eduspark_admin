// EduSpark Brand Colors - Matching Frontend
// This file contains all the brand colors used across the admin panel

export const COLORS = {
  // Primary Brand Colors
  PRIMARY: '#00ADEF',      // Bright Blue - Main brand color
  SECONDARY: '#FFA500',    // Vibrant Orange - Secondary actions
  ACCENT: '#FFD700',       // Lightning Yellow - Highlights and accents
  
  // Background Colors
  BACKGROUND_DARK: '#000000',
  BACKGROUND_DARK_BLUE: '#1a1a2e',
  BACKGROUND_NAVY: '#16213e',
  BACKGROUND_DEEP_PURPLE: '#0F0F23',
  BACKGROUND_MIDNIGHT: '#1E1E2E',
  BACKGROUND_STEEL: '#2D2D44',
  
  // Text Colors
  TEXT_WHITE: '#FFFFFF',
  TEXT_GRAY_LIGHT: '#D1D5DB',
  TEXT_GRAY: '#9CA3AF',
  TEXT_GRAY_DARK: '#6B7280',
  
  // Status Colors
  SUCCESS: '#10B981',      // Green
  ERROR: '#EF4444',        // Red
  WARNING: '#FFA500',      // Orange (using secondary)
  INFO: '#3B82F6',         // Blue
  
  // UI Colors
  BORDER_GRAY: '#374151',
  BORDER_GRAY_DARK: '#1F2937',
  
  // Opacity Variants
  PRIMARY_OPACITY_10: 'rgba(0, 173, 239, 0.1)',
  PRIMARY_OPACITY_15: 'rgba(0, 173, 239, 0.15)',
  PRIMARY_OPACITY_30: 'rgba(0, 173, 239, 0.3)',
  SECONDARY_OPACITY_15: 'rgba(255, 165, 0, 0.15)',
  SECONDARY_OPACITY_30: 'rgba(255, 165, 0, 0.3)',
  ACCENT_OPACITY_15: 'rgba(255, 215, 0, 0.15)',
  ACCENT_OPACITY_30: 'rgba(255, 215, 0, 0.3)',
  
  // Glow Effects
  PRIMARY_GLOW: 'rgba(0, 173, 239, 0.4)',
  SECONDARY_GLOW: 'rgba(255, 165, 0, 0.3)',
  ACCENT_GLOW: 'rgba(255, 215, 0, 0.4)',
};

// Gradient Combinations
export const GRADIENTS = {
  // Main Brand Gradient
  BRAND: 'linear-gradient(135deg, #00ADEF, #FFA500)',
  BRAND_REVERSE: 'linear-gradient(135deg, #FFA500, #00ADEF)',
  BRAND_WITH_ACCENT: 'linear-gradient(135deg, #00ADEF, #FFA500, #FFD700)',
  
  // Background Gradients
  BACKGROUND: 'linear-gradient(135deg, #000000 0%, #1a1a2e 50%, #16213e 100%)',
  BACKGROUND_ALT: 'linear-gradient(135deg, #0F0F23, #1E1E2E)',
  
  // Button Gradients
  PRIMARY_BUTTON: 'linear-gradient(135deg, #00ADEF, #0088CC)',
  SECONDARY_BUTTON: 'linear-gradient(135deg, #FFA500, #FF8C00)',
  SUCCESS_BUTTON: 'linear-gradient(135deg, #10B981, #059669)',
  DANGER_BUTTON: 'linear-gradient(135deg, #EF4444, #DC2626)',
  INFO_BUTTON: 'linear-gradient(135deg, #00ADEF, #3B82F6)',
};

// Box Shadows
export const SHADOWS = {
  PRIMARY: '0 4px 15px rgba(0, 173, 239, 0.4)',
  PRIMARY_HOVER: '0 6px 20px rgba(0, 173, 239, 0.6)',
  SECONDARY: '0 4px 15px rgba(255, 165, 0, 0.4)',
  CARD: '0 4px 15px rgba(0, 0, 0, 0.3)',
  CARD_HOVER: '0 8px 25px rgba(0, 0, 0, 0.4), 0 0 20px rgba(0, 173, 239, 0.3)',
};

// Usage Examples:
// import { COLORS, GRADIENTS, SHADOWS } from '../constants/colors';
// style={{ background: GRADIENTS.BRAND, color: COLORS.TEXT_WHITE }}


