'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'es' | 'fr';

interface Translations {
  [key: string]: {
    en: string;
    es: string;
    fr: string;
  };
}

const translations: Translations = {
  // Navigation
  'nav.home': { en: 'Home', es: 'Inicio', fr: 'Accueil' },
  'nav.products': { en: 'Products', es: 'Productos', fr: 'Produits' },
  'nav.apparel': { en: 'Apparel', es: 'Ropa', fr: 'Vêtements' },
  'nav.about': { en: 'About', es: 'Nosotros', fr: 'À propos' },
  'nav.contact': { en: 'Contact', es: 'Contacto', fr: 'Contact' },
  'nav.cart': { en: 'Cart', es: 'Carrito', fr: 'Panier' },
  'nav.login': { en: 'Login', es: 'Iniciar sesión', fr: 'Connexion' },
  'nav.admin': { en: 'Admin', es: 'Admin', fr: 'Admin' },
  
  // Common
  'common.search': { en: 'Search', es: 'Buscar', fr: 'Rechercher' },
  'common.loading': { en: 'Loading...', es: 'Cargando...', fr: 'Chargement...' },
  'common.save': { en: 'Save', es: 'Guardar', fr: 'Enregistrer' },
  'common.cancel': { en: 'Cancel', es: 'Cancelar', fr: 'Annuler' },
  'common.delete': { en: 'Delete', es: 'Eliminar', fr: 'Supprimer' },
  'common.edit': { en: 'Edit', es: 'Editar', fr: 'Modifier' },
  'common.view': { en: 'View', es: 'Ver', fr: 'Voir' },
  'common.add': { en: 'Add', es: 'Añadir', fr: 'Ajouter' },
  'common.submit': { en: 'Submit', es: 'Enviar', fr: 'Soumettre' },
  'common.success': { en: 'Success', es: 'Éxito', fr: 'Succès' },
  'common.error': { en: 'Error', es: 'Error', fr: 'Erreur' },
  
  // Products
  'products.title': { en: 'Products', es: 'Productos', fr: 'Produits' },
  'products.featured': { en: 'Featured Products', es: 'Productos destacados', fr: 'Produits en vedette' },
  'products.new': { en: 'New Arrivals', es: 'Novedades', fr: 'Nouveautés' },
  'products.price': { en: 'Price', es: 'Precio', fr: 'Prix' },
  'products.addToCart': { en: 'Add to Cart', es: 'Añadir al carrito', fr: 'Ajouter au panier' },
  'products.outOfStock': { en: 'Out of Stock', es: 'Agotado', fr: 'Rupture de stock' },
  'products.inStock': { en: 'In Stock', es: 'En stock', fr: 'En stock' },
  
  // Cart
  'cart.title': { en: 'Shopping Cart', es: 'Carrito de compras', fr: 'Panier' },
  'cart.empty': { en: 'Your cart is empty', es: 'Tu carrito está vacío', fr: 'Votre panier est vide' },
  'cart.subtotal': { en: 'Subtotal', es: 'Subtotal', fr: 'Sous-total' },
  'cart.shipping': { en: 'Shipping', es: 'Envío', fr: 'Livraison' },
  'cart.total': { en: 'Total', es: 'Total', fr: 'Total' },
  'cart.checkout': { en: 'Checkout', es: 'Pagar', fr: 'Paiement' },
  
  // Admin
  'admin.dashboard': { en: 'Dashboard', es: 'Panel', fr: 'Tableau de bord' },
  'admin.products': { en: 'Products', es: 'Productos', fr: 'Produits' },
  'admin.orders': { en: 'Orders', es: 'Pedidos', fr: 'Commandes' },
  'admin.customers': { en: 'Customers', es: 'Clientes', fr: 'Clients' },
  'admin.categories': { en: 'Categories', es: 'Categorías', fr: 'Catégories' },
  'admin.analytics': { en: 'Analytics', es: 'Analíticas', fr: 'Analytique' },
  'admin.settings': { en: 'Settings', es: 'Configuración', fr: 'Paramètres' },
  
  // Footer
  'footer.copyright': { en: 'All rights reserved.', es: 'Todos los derechos reservados.', fr: 'Tous droits réservés.' },
  'footer.privacy': { en: 'Privacy Policy', es: 'Política de privacidad', fr: 'Politique de confidentialité' },
  'footer.terms': { en: 'Terms of Service', es: 'Términos de servicio', fr: 'Conditions d\'utilisation' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  availableLanguages: { code: Language; name: string; flag: string }[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('preferred-language') as Language;
    if (saved && ['en', 'es', 'fr'].includes(saved)) {
      setLanguage(saved);
    } else {
      const browserLang = navigator.language.split('-')[0];
      if (['en', 'es', 'fr'].includes(browserLang)) {
        setLanguage(browserLang as Language);
      }
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('preferred-language', lang);
    document.documentElement.lang = lang;
  };

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
    return translation[language] || translation.en;
  };

  const availableLanguages = [
    { code: 'en' as Language, name: 'English', flag: '🇺🇸' },
    { code: 'es' as Language, name: 'Español', flag: '🇲🇽' },
    { code: 'fr' as Language, name: 'Français', flag: '🇨🇦' },
  ];

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t, availableLanguages }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
