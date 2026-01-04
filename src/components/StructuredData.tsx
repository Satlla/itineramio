/**
 * Structured Data (Schema.org) Component
 *
 * This component adds JSON-LD structured data to help search engines understand
 * the content and show rich snippets in search results.
 *
 * Benefits:
 * - Organization schema: Shows company info in Knowledge Graph
 * - WebSite schema: Enables sitelinks search box in Google
 * - SoftwareApplication schema: Shows app details, pricing, ratings in search
 * - Improves CTR from search results
 */

export function StructuredData() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Itineramio",
    "alternateName": "Itineramio - Manuales Digitales para Apartamentos Turísticos",
    "url": "https://www.itineramio.com",
    "logo": "https://www.itineramio.com/logo.png",
    "description": "Plataforma SaaS para crear manuales digitales interactivos para apartamentos y viviendas turísticas. Automatiza la información a huéspedes con códigos QR y zonas personalizadas.",
    "foundingDate": "2024",
    "slogan": "Adiós a las llamadas de madrugada",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+34",
      "contactType": "customer support",
      "email": "hola@itineramio.com",
      "availableLanguage": ["Spanish", "English"]
    },
    "sameAs": [
      "https://www.linkedin.com/company/itineramio",
      "https://twitter.com/itineramio"
    ],
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "ES",
      "addressLocality": "Madrid"
    }
  }

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Itineramio",
    "url": "https://www.itineramio.com",
    "description": "Crea manuales digitales para apartamentos turísticos. Ahorra tiempo y mejora la experiencia de tus huéspedes.",
    "inLanguage": "es-ES",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://www.itineramio.com/blog?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  }

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Itineramio",
    "applicationCategory": "BusinessApplication",
    "applicationSubCategory": "Property Management Software",
    "operatingSystem": "Web Browser, iOS, Android",
    "description": "Software para crear manuales digitales interactivos para apartamentos turísticos. Incluye códigos QR, gestión de zonas, analytics y automatización de comunicación con huéspedes.",
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "EUR",
      "lowPrice": "9",
      "highPrice": "99",
      "offerCount": "4",
      "priceSpecification": [
        {
          "@type": "UnitPriceSpecification",
          "price": "9",
          "priceCurrency": "EUR",
          "name": "Plan Basic",
          "description": "Hasta 2 propiedades",
          "billingIncrement": "P1M"
        },
        {
          "@type": "UnitPriceSpecification",
          "price": "29",
          "priceCurrency": "EUR",
          "name": "Plan Host",
          "description": "Hasta 10 propiedades",
          "billingIncrement": "P1M"
        },
        {
          "@type": "UnitPriceSpecification",
          "price": "69",
          "priceCurrency": "EUR",
          "name": "Plan Superhost",
          "description": "Hasta 25 propiedades",
          "billingIncrement": "P1M"
        },
        {
          "@type": "UnitPriceSpecification",
          "price": "99",
          "priceCurrency": "EUR",
          "name": "Plan Business",
          "description": "Hasta 50 propiedades",
          "billingIncrement": "P1M"
        }
      ]
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "127",
      "bestRating": "5",
      "worstRating": "1"
    },
    "featureList": [
      "Manuales digitales interactivos",
      "Códigos QR personalizados por zona",
      "Gestión de múltiples propiedades",
      "Analytics y métricas de uso",
      "Plantillas prediseñadas",
      "Soporte multiidioma",
      "Integración con Airbnb",
      "Envío automático pre check-in"
    ],
    "screenshot": "https://www.itineramio.com/screenshots/dashboard.png",
    "softwareVersion": "2.0",
    "datePublished": "2024-01-01",
    "author": {
      "@type": "Organization",
      "name": "Itineramio"
    },
    "creator": {
      "@type": "Organization",
      "name": "Itineramio"
    }
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Inicio",
        "item": "https://www.itineramio.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Funcionalidades",
        "item": "https://www.itineramio.com/funcionalidades"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Precios",
        "item": "https://www.itineramio.com/#pricing"
      }
    ]
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "¿Cómo funciona Itineramio?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Itineramio te permite crear manuales digitales para tus apartamentos turísticos en minutos. Organizas la información por zonas (WiFi, cocina, baño, etc.), generas códigos QR únicos para cada zona, y tus huéspedes acceden a toda la información desde su móvil sin necesidad de llamarte."
        }
      },
      {
        "@type": "Question",
        "name": "¿Cuánto cuesta Itineramio?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Los planes empiezan desde €9/mes para hasta 2 propiedades. Ofrecemos 4 planes: Basic (€9/mes, 2 propiedades), Host (€29/mes, 10 propiedades), Superhost (€69/mes, 25 propiedades) y Business (€99/mes, 50 propiedades). La primera propiedad es gratis para siempre."
        }
      },
      {
        "@type": "Question",
        "name": "¿Necesito conocimientos técnicos para usar Itineramio?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No, Itineramio está diseñado para ser súper fácil de usar. Si sabes usar WhatsApp, sabes usar Itineramio. Solo necesitas rellenar un formulario y añadir las instrucciones de tu apartamento. Tardarás menos de 10 minutos en crear tu primera guía."
        }
      },
      {
        "@type": "Question",
        "name": "¿Cómo acceden los huéspedes al manual?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Los huéspedes acceden al manual escaneando un código QR con su móvil. Puedes imprimir códigos QR generales o específicos por zona (uno para WiFi, otro para la cocina, etc.). También puedes enviar el link directo por WhatsApp o email."
        }
      },
      {
        "@type": "Question",
        "name": "¿Puedo probar Itineramio gratis?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sí, la primera propiedad es gratis para siempre. Puedes crear una cuenta sin tarjeta de crédito, crear tu primera guía digital y probarla con tus huéspedes. Si te gusta y quieres añadir más propiedades, simplemente elige el plan que necesites."
        }
      },
      {
        "@type": "Question",
        "name": "¿Funciona con Airbnb, Booking u otras plataformas?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sí, Itineramio funciona con cualquier plataforma de alquiler turístico. No importa si usas Airbnb, Booking, Vrbo o tu propia web. El manual digital es tuyo y puedes compartirlo con tus huéspedes de la manera que prefieras."
        }
      }
    ]
  }

  return (
    <>
      {/* Organization Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

      {/* WebSite Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />

      {/* Software Application Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />

      {/* Breadcrumb Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  )
}
