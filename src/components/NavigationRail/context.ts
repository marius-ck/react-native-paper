import * as React from 'react';

/**
 * Whether the enclosing rail is expanded. Items read this to switch between
 * the stacked (collapsed) and row (expanded) layouts.
 */
export const ExpandedContext = React.createContext(false);
