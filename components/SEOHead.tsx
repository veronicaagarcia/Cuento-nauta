import { Platform } from 'react-native';
import { Head } from 'expo-router/head';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'book';
}

const DEFAULT_TITLE = 'Cuento Nauta - Descubre y gestiona tus libros favoritos';
const DEFAULT_DESCRIPTION = 'Encuentra libros, gestiona tus favoritos, lee libros gratuitos en línea y lleva control de tu progreso de lectura con Cuento Nauta.';
const DEFAULT_KEYWORDS = ['libros', 'lectura', 'biblioteca', 'ebooks', 'books', 'reading', 'favoritos', 'gratis'];
const DEFAULT_IMAGE = '/assets/images/Logo.png';
const SITE_URL = 'https://your-domain.com'; // Replace with actual domain

export const SEOHead: React.FC<SEOHeadProps> = ({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  image = DEFAULT_IMAGE,
  url = SITE_URL,
  type = 'website',
}) => {
  // Only render on web platform
  if (Platform.OS !== 'web') {
    return null;
  }

  const fullTitle = title === DEFAULT_TITLE ? title : `${title} | Cuento Nauta`;
  const keywordsString = keywords.join(', ');

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywordsString} />
      <meta name="author" content="Cuento Nauta" />
      <meta name="language" content="es-ES" />
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      
      {/* Theme and App Info */}
      <meta name="theme-color" content="#bca5ae" />
      <meta name="application-name" content="Cuento Nauta" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="Cuento Nauta" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="Cuento Nauta" />
      <meta property="og:locale" content="es_ES" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:site" content="@cuentonauta" />
      
      {/* Additional SEO */}
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />
      
      {/* Book-specific schema if applicable */}
      {type === 'book' && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Cuento Nauta",
            "description": description,
            "url": url,
            "applicationCategory": "Entertainment",
            "operatingSystem": "All",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Búsqueda de libros",
              "Gestión de favoritos",
              "Lectura online gratuita",
              "Control de progreso de lectura"
            ]
          })}
        </script>
      )}
      
      <link rel="canonical" href={url} />
      <link rel="manifest" href="/manifest.json" />
    </Head>
  );
};