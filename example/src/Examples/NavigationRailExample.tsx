import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import {
  Button,
  Chip,
  FAB,
  IconButton,
  List,
  NavigationRail,
  Portal,
  Switch,
  Text,
  useTheme,
} from 'react-native-paper';
import type { NavigationRailProps } from 'react-native-paper';

type Alignment = NonNullable<NavigationRailProps['alignment']>;

const destinations = [
  { key: 'inbox', label: 'Inbox', icon: 'inbox-outline', activeIcon: 'inbox' },
  {
    key: 'starred',
    label: 'Starred',
    icon: 'star-outline',
    activeIcon: 'star',
  },
  { key: 'sent', label: 'Sent', icon: 'send-outline', activeIcon: 'send' },
  {
    key: 'drafts',
    label: 'Drafts',
    icon: 'file-outline',
    activeIcon: 'file',
  },
  {
    key: 'trash',
    label: 'Trash',
    icon: 'delete-outline',
    activeIcon: 'delete',
  },
];

const alignments: Alignment[] = ['top', 'center', 'bottom'];

const NavigationRailExample = () => {
  const { colors } = useTheme();
  const [active, setActive] = React.useState('inbox');
  const [expanded, setExpanded] = React.useState(false);
  const [alignment, setAlignment] = React.useState<Alignment>('top');
  const [labeled, setLabeled] = React.useState(true);
  const [modalVisible, setModalVisible] = React.useState(false);

  const renderItems = () =>
    destinations.map(({ key, label, ...rest }) => (
      <NavigationRail.Item
        key={key}
        {...rest}
        label={labeled ? label : undefined}
        badge={key === 'inbox' ? 12 : key === 'starred' ? true : undefined}
        disabled={key === 'trash'}
        active={active === key}
        onPress={() => setActive(key)}
      />
    ));

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <NavigationRail
        expanded={expanded}
        alignment={alignment}
        header={
          <>
            <IconButton
              icon="menu"
              aria-label="Toggle rail"
              onPress={() => setExpanded((value) => !value)}
            />
            <FAB icon="pencil" onPress={() => {}} />
          </>
        }
      >
        {renderItems()}
      </NavigationRail>

      <View style={styles.content}>
        <Text variant="headlineSmall">{active}</Text>
        <List.Item
          title="Expanded"
          right={() => (
            <View pointerEvents="none">
              <Switch value={expanded} />
            </View>
          )}
          onPress={() => setExpanded((value) => !value)}
        />
        <List.Item
          title="Labels"
          right={() => (
            <View pointerEvents="none">
              <Switch value={labeled} />
            </View>
          )}
          onPress={() => setLabeled((value) => !value)}
        />
        <View style={styles.chips}>
          {alignments.map((option) => (
            <Chip
              key={option}
              selected={option === alignment}
              showSelectedOverlay
              onPress={() => setAlignment(option)}
            >
              {option}
            </Chip>
          ))}
        </View>
        <Button mode="outlined" onPress={() => setModalVisible(true)}>
          Open modal rail
        </Button>
      </View>

      <Portal>
        <NavigationRail.Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          alignment={alignment}
          header={
            <IconButton
              icon="menu-open"
              aria-label="Close rail"
              onPress={() => setModalVisible(false)}
            />
          }
        >
          {renderItems()}
        </NavigationRail.Modal>
      </Portal>
    </View>
  );
};

NavigationRailExample.title = 'Navigation Rail';

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    flexDirection: 'row',
  },
  content: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
  chips: {
    flexDirection: 'row',
    gap: 8,
  },
});

export default NavigationRailExample;
