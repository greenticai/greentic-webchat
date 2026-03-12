import { translate } from '../i18n/runtimeI18n';

export function AuthCallbackPage({
  messages,
  providerId,
  status
}: {
  messages: Record<string, string>;
  providerId: string;
  status: { ok: boolean; reason: string; code?: string; error?: string };
}) {
  const body = status.ok
    ? translate(messages, 'auth.callback.success', { provider: providerId })
    : translate(messages, 'auth.callback.invalidState', { provider: providerId });

  return (
    <div className="status-card">
      <div className="callback-card">
        <h1>{translate(messages, 'auth.callback.title')}</h1>
        <p>{body}</p>
        <small>{translate(messages, 'auth.callback.deferred')}</small>
      </div>
    </div>
  );
}
