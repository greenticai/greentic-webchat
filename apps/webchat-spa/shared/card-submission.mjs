// Pure helpers deciding whether an Adaptive Card in a Web Chat transcript has
// already been submitted. Kept free of React and of Web Chat so it can be unit
// tested with `node --test` and reasoned about on its own.

export const ADAPTIVE_CARD_CONTENT_TYPE = 'application/vnd.microsoft.card.adaptive';

/**
 * @typedef {{
 *   id?: string,
 *   from?: { role?: string },
 *   channelData?: Record<string, unknown>,
 *   attachments?: Array<{ contentType?: string }>
 * }} TranscriptActivity
 */

/**
 * Web Chat stamps every activity it holds with `channelData['webchat:key']`,
 * which is stable from the moment an activity is sent until the server echoes
 * it back. `id` is the fallback for activities that carry no key.
 *
 * @param {TranscriptActivity} activity
 * @returns {string | undefined}
 */
export function activityKey(activity) {
  const key = activity.channelData?.['webchat:key'];
  return typeof key === 'string' && key ? key : activity.id;
}

/**
 * @param {TranscriptActivity} activity
 * @returns {boolean}
 */
export function hasAdaptiveCard(activity) {
  return (activity.attachments || []).some(
    (attachment) => attachment.contentType === ADAPTIVE_CARD_CONTENT_TYPE
  );
}

/**
 * An Action.Submit produces a user message whose channelData carries
 * `postBack: true`; a message the user typed does not.
 *
 * @param {TranscriptActivity} activity
 * @returns {boolean}
 */
export function isUserPostBack(activity) {
  return activity.from?.role === 'user' && activity.channelData?.postBack === true;
}

/**
 * A card counts as submitted when a user postback follows it in the transcript
 * before any newer card from the bot does: a newer card owns every postback
 * that comes after it, so an older card is never locked by a submit it did not
 * produce. A card that is not in the transcript is never submitted.
 *
 * @param {ReadonlyArray<TranscriptActivity>} activities
 * @param {TranscriptActivity} cardActivity
 * @returns {boolean}
 */
export function isCardSubmitted(activities, cardActivity) {
  const key = activityKey(cardActivity);
  if (!key) {
    return false;
  }
  const index = activities.findIndex((activity) => activityKey(activity) === key);
  if (index < 0) {
    return false;
  }
  for (let next = index + 1; next < activities.length; next += 1) {
    const activity = activities[next];
    if (isUserPostBack(activity)) {
      return true;
    }
    if (activity.from?.role !== 'user' && hasAdaptiveCard(activity)) {
      return false;
    }
  }
  return false;
}
