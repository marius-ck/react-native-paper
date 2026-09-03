import * as React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import type {
  GestureResponderEvent,
  NativeSyntheticEvent,
  StyleProp,
  TargetedEvent,
  ViewStyle,
} from 'react-native';

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { ExpandedContext } from './context';
import { NavigationRailTokens } from './tokens';
import { resolveItemColors } from './utils';
import { useInternalTheme } from '../../core/theming';
import { useReduceMotion } from '../../theme/accessibility/ReduceMotionContext';
import { tokens } from '../../theme/tokens';
import { toRawSpring } from '../../theme/tokens/sys/motion';
import { resolveCornerRadius } from '../../theme/utils/shape';
import type { ThemeProp } from '../../types';
import { isKeyboardFocusEvent } from '../../utils/isKeyboardFocusEvent';
import Badge from '../Badge';
import Icon from '../Icon';
import type { IconSource } from '../Icon';
import TouchableRipple from '../TouchableRipple/TouchableRipple';
import Text from '../Typography/Text';

export type Props = {
  /**
   * Icon of the destination.
   */
  icon: IconSource;
  /**
   * Icon shown while the destination is active. Falls back to `icon`.
   */
  activeIcon?: IconSource;
  /**
   * Label of the destination. Optional in the collapsed rail.
   */
  label?: string;
  /**
   * Whether the destination is the current one.
   */
  active?: boolean;
  /**
   * Whether the destination is disabled.
   */
  disabled?: boolean;
  /**
   * Badge shown on the icon: `true` for a dot, a `string` or `number` for text.
   */
  badge?: string | number | boolean;
  /**
   * Function to execute on press.
   */
  onPress?: (e: GestureResponderEvent) => void;
  /**
   * Function to execute on long press.
   */
  onLongPress?: (e: GestureResponderEvent) => void;
  /**
   * Accessibility label. Falls back to `label`.
   */
  'aria-label'?: string;
  /**
   * Specifies the largest possible scale a label font can reach.
   */
  labelMaxFontSizeMultiplier?: number;
  style?: StyleProp<ViewStyle>;
  /**
   * TestID used for testing purposes.
   */
  testID?: string;
  /**
   * @optional
   */
  theme?: ThemeProp;
};

const { item } = NavigationRailTokens;
const { opacity: stateOpacity, focusIndicator } = tokens.md.sys.state;

// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
const webNoOutline = { outline: 'none' } as unknown as ViewStyle;

/**
 * A destination inside a `NavigationRail`. Renders as a stacked icon and
 * label in the collapsed rail and as a full-width row in the expanded rail.
 *
 * ## Usage
 * ```js
 * import * as React from 'react';
 * import { NavigationRail } from 'react-native-paper';
 *
 * const MyComponent = () => (
 *   <NavigationRail.Item
 *     icon="inbox-outline"
 *     activeIcon="inbox"
 *     label="Inbox"
 *     badge={3}
 *     active
 *   />
 * );
 *
 * export default MyComponent;
 * ```
 */
const NavigationRailItem = ({
  icon,
  activeIcon,
  label,
  active = false,
  disabled = false,
  badge = false,
  onPress,
  onLongPress,
  'aria-label': ariaLabel = label,
  labelMaxFontSizeMultiplier,
  style,
  testID = 'navigation-rail-item',
  theme: themeOverrides,
}: Props) => {
  const theme = useInternalTheme(themeOverrides);
  const expanded = React.useContext(ExpandedContext);
  const reduceMotion = useReduceMotion();
  const [focused, setFocused] = React.useState(false);

  const colors = resolveItemColors({ theme, active, expanded });
  const indicatorRadius = resolveCornerRadius(theme, item.indicatorShape);
  const contentOpacity = disabled
    ? stateOpacity.disabled
    : stateOpacity.enabled;
  const hasLabel = !!label;

  const selection = useSharedValue(active ? 1 : 0);
  const pressed = useSharedValue(false);
  const hovered = useSharedValue(false);

  React.useEffect(() => {
    const target = active ? 1 : 0;
    selection.value = reduceMotion
      ? target
      : withSpring(target, toRawSpring(theme.motion.spring.fast.spatial));
  }, [active, reduceMotion, theme, selection]);

  const indicatorStyle = useAnimatedStyle(() => ({
    opacity: selection.value,
    transform: [{ scaleX: 0.5 + selection.value / 2 }],
  }));

  const stateLayerStyle = useAnimatedStyle(() => ({
    opacity: pressed.value
      ? stateOpacity.pressed
      : hovered.value
        ? stateOpacity.hovered
        : 0,
  }));

  const onFocus = (e: NativeSyntheticEvent<TargetedEvent>) => {
    if (!disabled && isKeyboardFocusEvent(e)) setFocused(true);
  };

  const badgeNode =
    badge === false ? null : (
      <Badge visible style={styles.badge}>
        {typeof badge === 'boolean' ? undefined : badge}
      </Badge>
    );

  const iconNode = (
    <Icon
      source={active ? (activeIcon ?? icon) : icon}
      size={item.iconSize}
      color={colors.icon}
    />
  );

  const labelNode = hasLabel ? (
    <Text
      variant={
        expanded ? item.expanded.labelTypescale : item.collapsed.labelTypescale
      }
      selectable={false}
      numberOfLines={expanded ? 1 : 2}
      maxFontSizeMultiplier={labelMaxFontSizeMultiplier}
      style={[
        expanded ? styles.labelExpanded : styles.labelCollapsed,
        { color: colors.label },
      ]}
      testID={`${testID}-label`}
    >
      {label}
    </Text>
  ) : null;

  const indicatorNode = (
    <>
      <Animated.View
        style={[
          styles.fill,
          { backgroundColor: colors.indicator, borderRadius: indicatorRadius },
          indicatorStyle,
        ]}
        testID={`${testID}-indicator`}
      />
      <Animated.View
        style={[
          styles.fill,
          { backgroundColor: colors.stateLayer, borderRadius: indicatorRadius },
          stateLayerStyle,
        ]}
      />
      {focused ? (
        <View
          style={[
            styles.fill,
            styles.focusRing,
            {
              borderColor: colors.focusIndicator,
              borderRadius: indicatorRadius + focusIndicator.outerOffset,
            },
          ]}
        />
      ) : null}
    </>
  );

  return (
    <TouchableRipple
      borderless
      rippleColor="transparent"
      disabled={disabled}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={() => {
        pressed.value = true;
      }}
      onPressOut={() => {
        pressed.value = false;
      }}
      onHoverIn={() => {
        hovered.value = true;
      }}
      onHoverOut={() => {
        hovered.value = false;
      }}
      onFocus={onFocus}
      onBlur={() => setFocused(false)}
      role="tab"
      aria-selected={active}
      aria-disabled={disabled}
      aria-label={ariaLabel}
      testID={testID}
      style={[
        expanded
          ? [styles.expandedItem, { borderRadius: indicatorRadius }]
          : [styles.collapsedItem, hasLabel && styles.collapsedItemLabeled],
        Platform.OS === 'web' ? webNoOutline : null,
        style,
      ]}
      theme={theme}
    >
      {expanded ? (
        <View style={[styles.row, { opacity: contentOpacity }]}>
          {indicatorNode}
          {iconNode}
          {labelNode}
          {badgeNode}
        </View>
      ) : (
        <View style={[styles.column, { opacity: contentOpacity }]}>
          <View
            style={[
              styles.collapsedIndicator,
              hasLabel && styles.collapsedIndicatorLabeled,
            ]}
          >
            {indicatorNode}
            {iconNode}
            <View style={styles.badgeAnchor}>{badgeNode}</View>
          </View>
          {labelNode}
        </View>
      )}
    </TouchableRipple>
  );
};

NavigationRailItem.displayName = 'NavigationRail.Item';

const styles = StyleSheet.create({
  collapsedItem: {
    width: item.collapsed.indicatorWidth,
    justifyContent: 'center',
  },
  collapsedItemLabeled: {
    width: '100%',
    minHeight: item.collapsed.minHeight,
  },
  expandedItem: {
    height: item.expanded.indicatorHeight,
  },
  column: {
    alignItems: 'center',
    pointerEvents: 'none',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingStart: item.expanded.leading,
    paddingEnd: item.expanded.trailing,
    gap: item.expanded.iconLabelGap,
    pointerEvents: 'none',
  },
  collapsedIndicator: {
    width: item.collapsed.indicatorWidth,
    height: item.collapsed.indicatorWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  collapsedIndicatorLabeled: {
    height: item.collapsed.indicatorHeight,
  },
  fill: {
    ...StyleSheet.absoluteFill,
  },
  focusRing: {
    margin: -focusIndicator.outerOffset,
    borderWidth: focusIndicator.thickness,
  },
  labelCollapsed: {
    marginTop: item.collapsed.iconLabelGap,
    textAlign: 'center',
  },
  labelExpanded: {
    flex: 1,
  },
  badge: {
    alignSelf: 'center',
  },
  badgeAnchor: {
    position: 'absolute',
    top: 0,
    start: (item.collapsed.indicatorWidth + item.iconSize) / 2 - 4,
  },
});

export default NavigationRailItem;
