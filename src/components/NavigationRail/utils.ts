import type { ColorValue } from 'react-native';

import { NavigationRailTokens } from './tokens';
import type { InternalTheme } from '../../types';

const { rail, colors } = NavigationRailTokens;

export type ItemColors = {
  icon: ColorValue;
  label: ColorValue;
  indicator: ColorValue;
  stateLayer: ColorValue;
  focusIndicator: ColorValue;
};

/**
 * Resolve item colors for the current selection state. The active label uses
 * `secondary` in the collapsed rail and matches the icon in the expanded rail.
 */
export const resolveItemColors = ({
  theme,
  active = false,
  expanded = false,
}: {
  theme: InternalTheme;
  active?: boolean;
  expanded?: boolean;
}): ItemColors => {
  const c = theme.colors;
  const activeLabel = expanded
    ? colors.activeExpandedLabel
    : colors.activeLabel;
  return {
    icon: c[active ? colors.activeIcon : colors.inactiveIcon],
    label: c[active ? activeLabel : colors.inactiveLabel],
    indicator: c[colors.activeIndicator],
    stateLayer: c[colors.stateLayer],
    focusIndicator: c[colors.focusIndicator],
  };
};

/**
 * Clamp a requested expanded width to the spec range (220–360dp).
 */
export const clampExpandedWidth = (width: number): number =>
  Math.min(Math.max(width, rail.expandedMinWidth), rail.expandedMaxWidth);
