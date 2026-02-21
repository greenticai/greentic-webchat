export function createStoreMiddleware() {
  return () => next => action => {
    if (action.type === 'WEB_CHAT/SEND_EVENT') {
      console.info('[local-demo hook] sending event', action);
    }
    return next(action);
  };
}

export function onBeforeRender(context) {
  console.info('[local-demo hook] rendering tenant', context.skin.tenant);
}
