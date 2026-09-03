import * as React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import type { ColorValue, StyleProp, ViewStyle } from 'react-native';

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import type { AnimatedStyle } from 'react-native-reanimated';

import { ExpandedContext } from './context';
import { NavigationRailTokens } from './tokens';
import type { Alignment } from './tokens';
import { clampExpandedWidth } from './utils';
import { useInternalTheme } from '../../core/theming';
import { useReduceMotion } from '../../theme/accessibility/ReduceMotionContext';
import { toRawSpring } from '../../theme/tokens/sys/motion';
import type { ThemeProp } from '../../types';

export type Props = {
  /**
   * Navigation destinations, typically `NavigationRail.Item` elements.
   */
  children: React.ReactNode;
  /**
   * Whether the rail is expanded (icon + label rows, 220–360dp wide) or
   * collapsed (stacked icon + label, 96dp wide). The width animates on change.
   */
  expanded?: boolean;
  /**
   * Width of the expanded rail. Clamped to the spec range of 220–360dp.
   */
  expandedWidth?: number;
  /**
   * Vertical placement of the destinations. Defaults to `top`.
   */
  alignment?: Alignment;
  /**
   * Content pinned above the destinations, e.g. a menu button and a `FAB`.
   */
  header?: React.ReactNode;
  /**
   * Container color override. Defaults to `theme.colors.surface`.
   */
  containerColor?: ColorValue;
  style?: StyleProp<AnimatedStyle<ViewStyle>>;
  /**
   * TestID used for testing purposes.
   */
  testID?: string;
  /**
   * @optional
   */
  theme?: ThemeProp;
};

const { rail, colors } = NavigationRailTokens;

const justifyContent = {
  top: 'flex-start',
  center: 'center',
  bottom: 'flex-end',
} as const satisfies Record<Alignment, ViewStyle['justifyContent']>;

/**
 * Navigation rails let people switch between UI views on mid-sized devices.
 * The rail is placed at the start edge of the screen and can be collapsed
 * (icons with short labels) or expanded (icons with full labels).
 *
 * ## Usage
 * ```js
 * import * as React from 'react';
 * import { StyleSheet, View } from 'react-native';
 * import { FAB, IconButton, NavigationRail } from 'react-native-paper';
 *
 * const MyComponent = () => {
 *   const [expanded, setExpanded] = React.useState(false);
 *   const [active, setActive] = React.useState('inbox');
 *
 *   return (
 *     <View style={styles.screen}>
 *       <NavigationRail
 *         expanded={expanded}
 *         header={
 *           <>
 *             <IconButton icon="menu" onPress={() => setExpanded((e) => !e)} />
 *             <FAB icon="pencil" onPress={() => {}} />
 *           </>
 *         }
 *       >
 *         <NavigationRail.Item
 *           icon="inbox-outline"
 *           activeIcon="inbox"
 *           label="Inbox"
 *           badge={12}
 *           active={active === 'inbox'}
 *           onPress={() => setActive('inbox')}
 *         />
 *         <NavigationRail.Item
 *           icon="send-outline"
 *           activeIcon="send"
 *           label="Sent"
 *           active={active === 'sent'}
 *           onPress={() => setActive('sent')}
 *         />
 *       </NavigationRail>
 *     </View>
 *   );
 * };
 *
 * const styles = StyleSheet.create({
 *   screen: { flex: 1, flexDirection: 'row' },
 * });
 *
 * export default MyComponent;
 * ```
 *
 * ## Theming
 * Customize by overriding these `theme.colors` roles:
 * - `surface`: container
 * - `secondaryContainer` / `onSecondaryContainer`: active indicator / active icon
 * - `secondary`: active label (collapsed), focus indicator
 * - `onSurfaceVariant`: inactive icon and label
 */
const NavigationRail = ({
  children,
  expanded = false,
  expandedWidth = rail.expandedMinWidth,
  alignment = 'top',
  header,
  containerColor,
  style,
  testID = 'navigation-rail',
  theme: themeOverrides,
}: Props) => {
  const theme = useInternalTheme(themeOverrides);
  const reduceMotion = useReduceMotion();

  const targetWidth = expanded
    ? clampExpandedWidth(expandedWidth)
    : rail.collapsedWidth;
  const width = useSharedValue(targetWidth);

  React.useEffect(() => {
    width.value = reduceMotion
      ? targetWidth
      : withSpring(
          targetWidth,
          toRawSpring(theme.motion.spring.default.spatial)
        );
  }, [targetWidth, reduceMotion, theme, width]);

  const widthStyle = useAnimatedStyle(() => ({ width: width.value }));

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: containerColor ?? theme.colors[colors.container] },
        widthStyle,
        style,
      ]}
      testID={testID}
    >
      <View style={[styles.content, { width: targetWidth }]}>
        {header ? (
          <View style={[styles.header, expanded && styles.headerExpanded]}>
            {header}
          </View>
        ) : null}
        <ScrollView
          style={styles.items}
          contentContainerStyle={[
            styles.itemsContent,
            expanded ? styles.itemsExpanded : styles.itemsCollapsed,
            { justifyContent: justifyContent[alignment] },
          ]}
          showsVerticalScrollIndicator={false}
          testID={`${testID}-items`}
        >
          <ExpandedContext.Provider value={expanded}>
            {children}
          </ExpandedContext.Provider>
        </ScrollView>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: '100%',
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    paddingTop: rail.topSpace,
  },
  header: {
    alignItems: 'center',
    gap: rail.itemSpace,
    marginBottom: rail.headerSpace,
  },
  headerExpanded: {
    alignItems: 'flex-start',
    paddingHorizontal: rail.itemHorizontalPadding,
  },
  items: {
    flex: 1,
  },
  itemsContent: {
    flexGrow: 1,
    gap: rail.itemSpace,
  },
  itemsCollapsed: {
    alignItems: 'center',
  },
  itemsExpanded: {
    paddingHorizontal: rail.itemHorizontalPadding,
  },
});

export default NavigationRail;

// @component-docs ignore-next-line
export { NavigationRail };
