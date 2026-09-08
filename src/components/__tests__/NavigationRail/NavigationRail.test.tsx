import { Text } from 'react-native';

import { describe, expect, it, jest } from '@jest/globals';

import { render, screen, userEvent } from '../../../test-utils';
import NavigationRail from '../../NavigationRail';

const items = (
  <>
    <NavigationRail.Item icon="inbox" label="Inbox" active badge={3} />
    <NavigationRail.Item icon="send" label="Sent" badge />
    <NavigationRail.Item icon="delete" label="Trash" disabled />
  </>
);

describe('NavigationRail render', () => {
  it('renders collapsed', async () => {
    expect(
      (await render(<NavigationRail>{items}</NavigationRail>)).toJSON()
    ).toMatchSnapshot();
  });

  it('renders expanded', async () => {
    expect(
      (await render(<NavigationRail expanded>{items}</NavigationRail>)).toJSON()
    ).toMatchSnapshot();
  });

  it('renders header and alignment', async () => {
    expect(
      (
        await render(
          <NavigationRail alignment="bottom" header={<Text>Header</Text>}>
            {items}
          </NavigationRail>
        )
      ).toJSON()
    ).toMatchSnapshot();
  });

  it('renders icon-only items', async () => {
    expect(
      (
        await render(
          <NavigationRail>
            <NavigationRail.Item icon="inbox" active />
          </NavigationRail>
        )
      ).toJSON()
    ).toMatchSnapshot();
  });
});

describe('NavigationRail layout', () => {
  it('uses collapsed width by default', async () => {
    await render(<NavigationRail>{items}</NavigationRail>);

    expect(screen.getByTestId('navigation-rail')).toHaveStyle({
      width: 96,
    });
  });

  it('keeps the collapsed footprint and fades the scrim in overlay mode', async () => {
    const onDismiss = jest.fn();
    const { rerender } = await render(
      <NavigationRail overlay onDismiss={onDismiss}>
        {items}
      </NavigationRail>
    );

    expect(screen.getByTestId('navigation-rail-scrim')).toHaveStyle({
      opacity: 0,
    });

    await rerender(
      <NavigationRail overlay expanded onDismiss={onDismiss}>
        {items}
      </NavigationRail>
    );

    expect(screen.getByTestId('navigation-rail')).toHaveStyle({ width: 220 });
    expect(screen.getByTestId('navigation-rail').parent).toHaveStyle({
      width: 96,
    });
    expect(screen.getByTestId('navigation-rail-scrim')).toHaveStyle({
      opacity: 0.32,
    });

    await userEvent.setup().press(screen.getByTestId('navigation-rail-scrim'));

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('clamps the expanded width to the spec range', async () => {
    await render(
      <NavigationRail expanded expandedWidth={500}>
        {items}
      </NavigationRail>
    );

    expect(screen.getByTestId('navigation-rail')).toHaveStyle({
      width: 360,
    });
  });
});

describe('NavigationRail.Item', () => {
  it('shows the active icon only when active', async () => {
    await render(
      <NavigationRail>
        <NavigationRail.Item
          icon="inbox-outline"
          activeIcon="inbox"
          label="Inbox"
          active
          testID="active"
        />
        <NavigationRail.Item
          icon="send-outline"
          activeIcon="send"
          label="Sent"
          testID="inactive"
        />
      </NavigationRail>
    );

    expect(screen.getByTestId('active')).toBeSelected();
    expect(screen.getByTestId('inactive')).not.toBeSelected();
    expect(screen.getByTestId('active-indicator')).toHaveStyle({
      opacity: 1,
    });
    expect(screen.getByTestId('inactive-indicator')).toHaveStyle({
      opacity: 0,
    });
  });

  it('shows the stacked label collapsed and the row label expanded', async () => {
    const { rerender } = await render(
      <NavigationRail>
        <NavigationRail.Item icon="inbox" label="Inbox" />
      </NavigationRail>
    );

    expect(screen.getByTestId('navigation-rail-item-label')).toBeOnTheScreen();
    expect(
      screen.queryByTestId('navigation-rail-item-label-expanded')
    ).toBeNull();

    await rerender(
      <NavigationRail expanded>
        <NavigationRail.Item icon="inbox" label="Inbox" />
      </NavigationRail>
    );

    expect(screen.queryByTestId('navigation-rail-item-label')).toBeNull();
    expect(
      screen.getByTestId('navigation-rail-item-label-expanded')
    ).toBeOnTheScreen();
  });

  it('uses the label as accessibility label', async () => {
    await render(
      <NavigationRail>
        <NavigationRail.Item icon="inbox" label="Inbox" />
      </NavigationRail>
    );

    expect(screen.getByRole('tab', { name: 'Inbox' })).toBeOnTheScreen();
  });

  it('calls onPress', async () => {
    const user = userEvent.setup();
    const onPress = jest.fn();
    await render(
      <NavigationRail>
        <NavigationRail.Item icon="inbox" label="Inbox" onPress={onPress} />
      </NavigationRail>
    );

    await user.press(screen.getByRole('tab'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', async () => {
    const user = userEvent.setup();
    const onPress = jest.fn();
    await render(
      <NavigationRail>
        <NavigationRail.Item
          icon="inbox"
          label="Inbox"
          disabled
          onPress={onPress}
        />
      </NavigationRail>
    );

    await user.press(screen.getByRole('tab'));

    expect(onPress).not.toHaveBeenCalled();
    expect(screen.getByRole('tab')).toBeDisabled();
  });

  it('renders badge text', async () => {
    await render(
      <NavigationRail>
        <NavigationRail.Item icon="inbox" label="Inbox" badge={12} />
      </NavigationRail>
    );

    expect(screen.getByText('12')).toBeOnTheScreen();
  });
});
