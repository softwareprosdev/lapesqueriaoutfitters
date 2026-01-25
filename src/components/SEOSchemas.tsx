export default function SEOSchemas() {
  // Organization Schema with McAllen address
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "La Pesqueria Outfitters",
    "description": "Premium fishing apparel and gear in McAllen, TX. High-performance T-shirts, hats, and coastal gear for the modern angler.",
    "url": "https://lapesqueria.com",
    "logo": "https://lapesqueria.com/images/lapescerialogo.png",
    "foundingDate": "2025",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "4400 N 23rd St Suite 135",
      "addressLocality": "McAllen",
      "addressRegion": "TX",
      "postalCode": "78504",
      "addressCountry": "US"
    },
    "areaServed": {
      "@type": "Place",
      "name": "McAllen, TX and surrounding areas including South Padre Island, Rio Grande Valley"
    },
    "sameAs": [
      "https://facebook.com/lapesqueriaoutfitters",
      "https://instagram.com/lapesqueriaoutfitters"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Service",
      "email": "info@lapesqueria.com"
    }
  };

  // Local Business Schema with McAllen address
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "La Pesqueria Outfitters - Fishing Apparel McAllen TX",
    "image": "https://lapesqueria.com/images/lapescerialogo.png",
    "description": "Premier fishing apparel store in McAllen, TX. Premium performance T-shirts, hats, and gear for anglers. UPF 50+ protection, moisture-wicking, and salt-resistant apparel.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "4400 N 23rd St Suite 135",
      "addressLocality": "McAllen",
      "addressRegion": "TX",
      "postalCode": "78504",
      "addressCountry": "US"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "26.2453",
      "longitude": "-98.2531"
    },
    "url": "https://lapesqueriaoutfitters.com",
    "telephone": "+1-956-XXX-XXXX",
    "priceRange": "$$",
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
      ],
      "opens": "10:00",
      "closes": "19:00"
    },
    "paymentAccepted": "Credit Card, Debit Card, Cash, Apple Pay",
    "currenciesAccepted": "USD",
    "areaServed": {
      "@type": "Place",
      "name": "McAllen, TX, South Padre Island, Harlingen, Brownsville, Rio Grande Valley"
    }
  };

  // Website Schema with Search Action
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "La Pesqueria Outfitters - Fishing Apparel McAllen TX",
    "url": "https://lapesqueria.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://lapesqueria.com/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  // E-commerce Site Schema
  const ecommerceSchema = {
    "@context": "https://schema.org",
    "@type": "Store",
    "name": "La Pesqueria Outfitters - Fishing Apparel & Gear",
    "description": "Shop premium fishing apparel in McAllen, TX. Performance T-shirts with UPF 50+ protection, moisture-wicking hats, and salt-resistant gear for serious anglers.",
    "url": "https://lapesqueria.com",
    "image": "https://lapesqueria.com/images/lapescerialogo.png",
    "brand": {
      "@type": "Brand",
      "name": "La Pesqueria Outfitters"
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "4400 N 23rd St Suite 135",
      "addressLocality": "McAllen",
      "addressRegion": "TX",
      "postalCode": "78504",
      "addressCountry": "US"
    },
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "USD",
      "lowPrice": "24.99",
      "highPrice": "89.99",
      "offerCount": "50"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Fishing Apparel Collection",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "Performance Fishing T-Shirts",
            "description": "UPF 50+ sun protection, moisture-wicking, salt-resistant fishing shirts",
            "brand": {
              "@type": "Brand",
              "name": "La Pesqueria Outfitters"
            },
            "offers": {
              "@type": "AggregateOffer",
              "priceCurrency": "USD",
              "lowPrice": "29.99",
              "highPrice": "49.99",
              "availability": "https://schema.org/InStock",
              "offerCount": "20"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "reviewCount": "47",
              "bestRating": "5",
              "worstRating": "1"
            }
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "Fishing Hats & Caps",
            "description": "Performance fishing hats with sun protection and moisture management",
            "brand": {
              "@type": "Brand",
              "name": "La Pesqueria Outfitters"
            },
            "offers": {
              "@type": "AggregateOffer",
              "priceCurrency": "USD",
              "lowPrice": "24.99",
              "highPrice": "44.99",
              "availability": "https://schema.org/InStock",
              "offerCount": "15"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "reviewCount": "32",
              "bestRating": "5",
              "worstRating": "1"
            }
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "Fishing Gear & Accessories",
            "description": "Essential fishing accessories and coastal gear for anglers",
            "brand": {
              "@type": "Brand",
              "name": "La Pesqueria Outfitters"
            },
            "offers": {
              "@type": "AggregateOffer",
              "priceCurrency": "USD",
              "lowPrice": "14.99",
              "highPrice": "89.99",
              "availability": "https://schema.org/InStock",
              "offerCount": "25"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.7",
              "reviewCount": "18",
              "bestRating": "5",
              "worstRating": "1"
            }
          }
        }
      ]
    }
  };

  return (
    <>
      {/* Organization Schema */}
      <script
        key="org-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

      {/* Local Business Schema */}
      <script
        key="local-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />

      {/* Website Schema */}
      <script
        key="website-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />

      {/* E-commerce Store Schema */}
      <script
        key="ecommerce-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ecommerceSchema) }}
      />
    </>
  );
}
