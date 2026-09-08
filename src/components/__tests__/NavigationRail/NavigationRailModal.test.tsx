import { afterEach, describe, expect, it, jest } from '@jest/globals';

import { act, render, screen, userEvent } from '../../../test-utils';
import NavigationRail from '../../NavigationRail';
import Portal from '../../Portal/Portal';

const renderModal = (visible: boolean, onDismiss = jest.fn()) =>
  render(
    <Portal.Host>
      <NavigationRail.Modal visible={visible} onDismiss={onDismiss}>
        <NavigationRail.Item icon="inbox" label="Inbox" active />
        <NavigationRail.Item icon="send" label="Sent" />
      </NavigationRail.Modal>
    </Portal.Host>
  );

describe('NavigationRail.Modal', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders when visible', async () => {
    expect((await renderModal(true)).toJSON()).toMatchSnapshot();
  });

  it('renders nothing when hidden', async () => {
    await renderModal(false);

    expect(screen.queryByTestId('navigation-rail-modal')).toBeNull();
  });

  it('slides out before unmounting on dismiss', async () => {
    jest.useFakeTimers();
    const { rerender } = await renderModal(true);

    await rerender(
      <Portal.Host>
        <NavigationRail.Modal visible={false}>
          <NavigationRail.Item icon="inbox" label="Inbox" active />
        </NavigationRail.Modal>
      </Portal.Host>
    );

    expect(screen.getByTestId('navigation-rail-modal-surface')).toHaveStyle({
      transform: [{ translateX: -220 }],
    });
    expect(screen.getByTestId('navigation-rail-modal-backdrop')).toHaveStyle({
      opacity: 0,
    });

    await act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(screen.queryByTestId('navigation-rail-modal')).toBeNull();
  });

  it('unmounts immediately on dismiss when not animated', async () => {
    jest.useFakeTimers();
    const { rerender } = await render(
      <Portal.Host>
        <NavigationRail.Modal visible animated={false}>
          <NavigationRail.Item icon="inbox" label="Inbox" active />
        </NavigationRail.Modal>
      </Portal.Host>
    );

    await rerender(
      <Portal.Host>
        <NavigationRail.Modal visible={false} animated={false}>
          <NavigationRail.Item icon="inbox" label="Inbox" active />
        </NavigationRail.Modal>
      </Portal.Host>
    );
    await act(() => {
      jest.advanceTimersByTime(0);
    });

    expect(screen.queryByTestId('navigation-rail-modal')).toBeNull();
  });

  it('renders items in the expanded layout', async () => {
    await renderModal(true);

    expect(screen.getByTestId('navigation-rail-modal-rail')).toHaveStyle({
      width: 220,
    });
    expect(screen.getAllByRole('tab')).toHaveLength(2);
  });

  it('dismisses on scrim press', async () => {
    const user = userEvent.setup();
    const onDismiss = jest.fn();
    await renderModal(true, onDismiss);

    await user.press(screen.getByTestId('navigation-rail-modal-backdrop'));

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
