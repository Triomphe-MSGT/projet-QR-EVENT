import React from 'react';
import * as LucideIcons from 'lucide-react';

/**
 * CategoryIcon renders a Lucide icon if iconName is provided and valid,
 * otherwise falls back to the emoji or a default icon.
 */
const CategoryIcon = ({ iconName, emoji, className = "w-4 h-4" }) => {
  const IconComponent = LucideIcons[iconName];

  if (IconComponent) {
    return <IconComponent className={className} />;
  }

  if (emoji) {
    return <span className={className}>{emoji}</span>;
  }

  // Fallback
  const DefaultIcon = LucideIcons.Tag;
  return <DefaultIcon className={className} />;
};

export default CategoryIcon;
