import type { ReactNode } from 'react';
import { ADAPTIVE_CARD_CONTENT_TYPE, isCardSubmitted } from '../../shared/card-submission.mjs';
import type { AttachmentMiddleware, WebChatActivity, WebChatHooks } from '../types';

export { isCardSubmitted };

interface LockedCardProps {
  activity: WebChatActivity;
  children: ReactNode;
}

/**
 * Builds an attachment middleware that locks an Adaptive Card once the user has
 * submitted it: the card stays visible, dimmed, and stops taking input, so it
 * can neither reset to an empty form nor be submitted a second time.
 *
 * "Submitted" is derived from the transcript (see `isCardSubmitted`), never
 * from DOM state, so it survives re-renders and reconnects.
 *
 * The wrapper component is rendered by Web Chat's own React. It therefore calls
 * Web Chat's hooks only: the SPA bundles a separate React copy, and calling its
 * hooks here is an invalid hook call. The JSX elements themselves are plain
 * objects and cross that boundary fine.
 */
export function createLockSubmittedCardsMiddleware(hooks: WebChatHooks): AttachmentMiddleware {
  function LockedCard({ activity, children }: LockedCardProps) {
    const [activities] = hooks.useActivities();
    if (!isCardSubmitted(activities, activity)) {
      return <>{children}</>;
    }
    return (
      <div
        data-greentic-card="submitted"
        aria-disabled="true"
        // React 18 drops a boolean `inert`; the empty string sets the attribute.
        {...{ inert: '' }}
        style={{ pointerEvents: 'none', opacity: 0.55, filter: 'grayscale(0.3)' }}
      >
        {children}
      </div>
    );
  }

  return () => (next) => (card) => {
    const rendered = next(card);
    if (card.attachment?.contentType !== ADAPTIVE_CARD_CONTENT_TYPE) {
      return rendered;
    }
    return <LockedCard activity={card.activity}>{rendered}</LockedCard>;
  };
}
