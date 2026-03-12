import { ConnectionDot } from './ConnectionDot';
import { useTokenFetchState } from '../state/token';
import { useWebChatConnectionStatus } from '../state/connection';
import { translate } from '../i18n/runtimeI18n';

type BrandColors = {
  ok?: string;
  warn?: string;
  err?: string;
};

export function StatusBar({
  className,
  brand,
  messages,
  show = true
}: {
  className?: string;
  brand?: BrandColors;
  messages?: Record<string, string>;
  show?: boolean;
}) {
  const connectionStatus = useWebChatConnectionStatus();
  const tokenFetchState = useTokenFetchState();

  if (!show) {
    return null;
  }

  let text = translate(messages || {}, 'status.connecting');
  let kind: 'ok' | 'warn' | 'err' = 'warn';

  if (tokenFetchState === 'idle') {
    text = translate(messages || {}, 'status.readyToConnect');
    kind = 'warn';
  } else if (tokenFetchState === 'error') {
    text = translate(messages || {}, 'status.tokenError');
    kind = 'err';
  } else if (connectionStatus === 'connected') {
    text = translate(messages || {}, 'status.connected');
    kind = 'ok';
  } else if (connectionStatus === 'failedToConnect' || connectionStatus === 'expiredToken' || connectionStatus === 'reconnecting') {
    text = translate(messages || {}, 'status.disconnectedReconnecting');
    kind = 'err';
  }

  return (
    <div className={className ? `${className} status-bar` : 'status-bar'} role="status" aria-live="polite">
      <ConnectionDot kind={kind} brand={brand} />
      <span>{text}</span>
    </div>
  );
}
