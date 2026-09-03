import * as React from 'react';
import { StyleSheet } from 'react-native';
import type { ViewStyle } from 'react-native';

import { cubicBezier } from 'react-native-reanimated';
import type { AnimatedStyle } from 'react-native-reanimated';

import NavigationRail from './NavigationRail';
import type { Props as NavigationRailProps } from './NavigationRail';
import { NavigationRailTokens } from './tokens';
import { clampExpandedWidth } from './utils';
import { useLocale } from '../../core/locale';
import { useInternalTheme } from '../../core/theming';
import { resolveCornerRadius } from '../../theme/utils/shape';
import Modal from '../Modal';

export type Props = Omit<
  NavigationRailProps,
  'expanded' | 'containerColor' | 'style'
> & {
  /**
   * Whether the modal rail is visible.
   */
  visible: boolean;
  /**
   * Callback that is called when the user dismisses the rail.
   */
  onDismiss?: () => void;
  /**
   * Determines whether tapping the scrim dismisses the rail.
   */
  dismissable?: boolean;
  /**
   * Accessibility label for the scrim.
   */
  overlayAccessibilityLabel?: string;
  style?: NavigationRailProps['style'];
};

const { rail, colors } = NavigationRailTokens;

/**
 * An expanded navigation rail shown above the content with a scrim, for
 * layouts where the rail is not permanently visible. Wrap it in a `Portal`
 * to render above other components.
 *
 * ## Usage
 * ```js
 * import * as React from 'react';
 * import { Button, NavigationRail, Portal } from 'react-native-paper';
 *
 * const MyComponent = () => {
 *   const [visible, setVisible] = React.useState(false);
 *
 *   return (
 *     <>
 *       <Portal>
 *         <NavigationRail.Modal
 *           visible={visible}
 *           onDismiss={() => setVisible(false)}
 *         >
 *           <NavigationRail.Item icon="inbox" label="Inbox" active />
 *           <NavigationRail.Item icon="send" label="Sent" />
 *         </NavigationRail.Modal>
 *       </Portal>
 *       <Button onPress={() => setVisible(true)}>Open</Button>
 *     </>
 *   );
 * };
 *
 * export default MyComponent;
 * ```
 */
const NavigationRailModal = ({
  visible,
  onDismiss,
  dismissable,
  overlayAccessibilityLabel,
  expandedWidth = rail.expandedMinWidth,
  style,
  testID = 'navigation-rail-modal',
  theme: themeOverrides,
  ...rest
}: Props) => {
  const theme = useInternalTheme(themeOverrides);
  const { direction } = useLocale();
  const [shown, setShown] = React.useState(false);

  React.useEffect(() => {
    const timeout = setTimeout(() => setShown(visible), 0);
    return () => clearTimeout(timeout);
  }, [visible]);

  const width = clampExpandedWidth(expandedWidth);
  const offscreen = direction === 'rtl' ? width : -width;

  // Duration follows the Modal's fade, which `Surface` applies last.
  const slideStyle: AnimatedStyle<ViewStyle> = {
    transform: [{ translateX: shown ? 0 : offscreen }],
    transitionProperty: 'transform',
    transitionTimingFunction: cubicBezier(
      ...(shown
        ? theme.motion.easing.emphasizedDecelerate
        : theme.motion.easing.emphasizedAccelerate)
    ),
  };

  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      dismissable={dismissable}
      overlayAccessibilityLabel={overlayAccessibilityLabel}
      contentBackgroundColor={theme.colors[colors.modalContainer]}
      contentElevation={rail.modalElevation}
      contentBorderRadius={resolveCornerRadius(theme, rail.modalShape)}
      style={styles.wrapper}
      contentContainerStyle={[styles.content, slideStyle]}
      theme={theme}
      testID={testID}
    >
      <NavigationRail
        {...rest}
        expanded
        expandedWidth={width}
        containerColor="transparent"
        style={style}
        theme={theme}
        testID={`${testID}-rail`}
      />
    </Modal>
  );
};

NavigationRailModal.displayName = 'NavigationRail.Modal';

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 0,
    marginBottom: 0,
    alignItems: 'flex-start',
  },
  content: {
    flex: 1,
  },
});

export default NavigationRailModal;
