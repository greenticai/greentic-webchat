import {
  buildCategoryMenuActivities,
  buildNaturalLanguageMatchActivities,
  buildPlaybookFlowActivities,
  buildPlaybookListActivities
} from '../../shared/playbook-engine.mjs';

interface PlaybookMiddlewareOptions {
  locale: string;
  messages?: Record<string, string>;
}

interface WebChatAction {
  type?: string;
  payload?: {
    activity?: {
      text?: string;
      type?: string;
      value?: {
        playbookAction?: string;
        categoryId?: string;
        playbookId?: string;
      };
    };
  };
}

function dispatchActivities(store: { dispatch: (action: unknown) => unknown }, activities: Array<Record<string, unknown>>) {
  for (const activity of activities) {
    store.dispatch({
      type: 'DIRECT_LINE/INCOMING_ACTIVITY',
      payload: { activity }
    });
  }
}

function resolvePlaybookActivities(action: WebChatAction, messages?: Record<string, string>) {
  const activity = action.payload?.activity;
  const playbookAction = activity?.value?.playbookAction;

  if (playbookAction === 'show-categories') {
    return buildCategoryMenuActivities(messages);
  }
  if (playbookAction === 'show-category' && activity?.value?.categoryId) {
    return buildPlaybookListActivities(activity.value.categoryId, messages);
  }
  if (playbookAction === 'launch-playbook' && activity?.value?.playbookId) {
    return buildPlaybookFlowActivities(activity.value.playbookId, messages);
  }
  if (activity?.type === 'message' && activity.text?.trim()) {
    return buildNaturalLanguageMatchActivities(activity.text, messages);
  }
  return [];
}

export function createPlaybookStoreMiddleware({ locale, messages }: PlaybookMiddlewareOptions) {
  let hasShownMenu = false;

  return (store: { dispatch: (action: unknown) => unknown }) =>
    (next: (action: unknown) => unknown) =>
    (action: unknown) => {
      const typedAction = action as WebChatAction;

      if (typedAction.type === 'DIRECT_LINE/CONNECT_FULFILLED' && !hasShownMenu) {
        hasShownMenu = true;
        const result = next(action);
        dispatchActivities(store, buildCategoryMenuActivities(messages));
        return result;
      }

      if (typedAction.type === 'DIRECT_LINE/POST_ACTIVITY') {
        const activities = resolvePlaybookActivities(typedAction, messages);
        if (activities.length > 0) {
          dispatchActivities(store, activities);
          return false;
        }
      }

      if (typedAction.type === 'WEB_CHAT/SEND_EVENT' && locale) {
        // Keep locale in closure so the middleware can be rebuilt cleanly on locale change.
      }

      return next(action);
    };
}
