/**
 * Accessibility utilities for better user experience
 */

// Generate accessibility labels for books
export const generateBookAccessibilityLabel = (
  title: string,
  authors?: string[],
  year?: string,
  isFavorite?: boolean,
  readingStatus?: string
): string => {
  let label = `Libro: ${title}`;
  
  if (authors && authors.length > 0) {
    label += `, por ${authors.join(', ')}`;
  }
  
  if (year) {
    label += `, publicado en ${year}`;
  }
  
  if (isFavorite) {
    label += ', en favoritos';
  }
  
  if (readingStatus) {
    label += `, estado: ${readingStatus}`;
  }
  
  return label;
};

// Generate accessibility hints
export const generateBookAccessibilityHint = (
  hasPreview?: boolean,
  isFavorite?: boolean
): string => {
  let hint = 'Toca para ver detalles';
  
  if (hasPreview) {
    hint += ', incluye vista previa para leer';
  }
  
  if (isFavorite) {
    hint += ', toca el corazón para quitar de favoritos';
  } else {
    hint += ', toca el corazón para agregar a favoritos';
  }
  
  return hint;
};

// Status labels for reading states
export const getReadingStatusAccessibilityLabel = (status?: string): string => {
  switch (status) {
    case 'Leído':
      return 'Libro completado';
    case 'Leyendo':
      return 'Leyendo actualmente';
    case 'Por leer':
      return 'Pendiente de lectura';
    default:
      return 'Sin estado de lectura';
  }
};

// Button accessibility labels
export const getButtonAccessibilityLabel = (action: string, itemName?: string): string => {
  const actionLabels = {
    favorite: itemName ? `Agregar ${itemName} a favoritos` : 'Agregar a favoritos',
    unfavorite: itemName ? `Quitar ${itemName} de favoritos` : 'Quitar de favoritos',
    search: 'Buscar libros',
    clear: 'Limpiar búsqueda',
    back: 'Volver atrás',
    close: 'Cerrar',
    retry: 'Intentar de nuevo',
    refresh: 'Actualizar',
    details: itemName ? `Ver detalles de ${itemName}` : 'Ver detalles',
    read: itemName ? `Leer ${itemName}` : 'Leer libro',
  };
  
  return actionLabels[action as keyof typeof actionLabels] || action;
};

// Form accessibility helpers
export const getFormFieldAccessibilityProps = (
  label: string,
  error?: string,
  required?: boolean,
  hint?: string
) => {
  const props: any = {
    accessibilityLabel: label,
    accessibilityRole: 'textbox' as const,
  };
  
  if (required) {
    props.accessibilityLabel += ', requerido';
  }
  
  if (error) {
    props.accessibilityLabel += `, error: ${error}`;
    props.accessibilityInvalid = true;
  }
  
  if (hint) {
    props.accessibilityHint = hint;
  }
  
  return props;
};

// Loading state accessibility
export const getLoadingAccessibilityProps = (message: string = 'Cargando') => ({
  accessibilityLabel: message,
  accessibilityRole: 'progressbar' as const,
  accessibilityState: { busy: true },
});

// Error state accessibility
export const getErrorAccessibilityProps = (error: string) => ({
  accessibilityLabel: `Error: ${error}`,
  accessibilityRole: 'alert' as const,
  accessibilityLiveRegion: 'assertive' as const,
});

// Success/confirmation accessibility
export const getSuccessAccessibilityProps = (message: string) => ({
  accessibilityLabel: `Éxito: ${message}`,
  accessibilityRole: 'status' as const,
  accessibilityLiveRegion: 'polite' as const,
});

// List item accessibility
export const getListItemAccessibilityProps = (
  index: number,
  total: number,
  itemDescription: string
) => ({
  accessibilityLabel: `${itemDescription}, elemento ${index + 1} de ${total}`,
  accessibilityRole: 'button' as const,
});

// Modal accessibility
export const getModalAccessibilityProps = (title: string) => ({
  accessibilityViewIsModal: true,
  accessibilityLabel: `Modal: ${title}`,
  accessibilityRole: 'dialog' as const,
});

// Tab accessibility
export const getTabAccessibilityProps = (
  tabName: string,
  isSelected: boolean,
  tabIndex: number,
  totalTabs: number
) => ({
  accessibilityLabel: `${tabName}, pestaña ${tabIndex + 1} de ${totalTabs}`,
  accessibilityRole: 'tab' as const,
  accessibilityState: { selected: isSelected },
});

// Image accessibility
export const getImageAccessibilityProps = (
  title: string,
  authors?: string[],
  isDecorative?: boolean
) => {
  if (isDecorative) {
    return {
      accessibilityRole: 'image' as const,
      accessibilityElementsHidden: true,
    };
  }
  
  let label = `Portada del libro ${title}`;
  if (authors && authors.length > 0) {
    label += ` de ${authors.join(', ')}`;
  }
  
  return {
    accessibilityLabel: label,
    accessibilityRole: 'image' as const,
  };
};

// Announce to screen readers
export const announceForAccessibility = (message: string) => {
  // This would need platform-specific implementation
  // For now, we'll use console.log to indicate the announcement
  console.log(`[Accessibility Announcement]: ${message}`);
};