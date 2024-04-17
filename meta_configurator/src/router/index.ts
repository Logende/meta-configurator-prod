import {createRouter, createWebHistory} from 'vue-router';
import {useSessionStore} from '@/store/sessionStore';
import {SessionMode} from '@/store/sessionMode';

/**
 * The router of the application.
 * It defines the routes and the corresponding components.
 */
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'file',
      component: () => import('../views/FileEditorView.vue'),
      meta: {
        title: 'FileEditor',
        sessionMode: SessionMode.FileEditor,
      },
    },
    {
      path: '/schema',
      name: 'schema',
      component: () => import('../views/SchemaEditorView.vue'),
      meta: {
        title: 'SchemaEditor',
        sessionMode: SessionMode.SchemaEditor,
      },
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/SettingsEditorView.vue'),
      meta: {
        title: 'SettingEditor',
        sessionMode: SessionMode.Settings,
      },
    },
  ],
});

const DEFAULT_TITLE = 'MetaConfigurator';

router.beforeEach((to, from, next) => {
  // Update the page title based on the current route
  document.title = (to.meta.title || DEFAULT_TITLE) as string;

  useSessionStore().currentMode = to.meta.sessionMode as SessionMode;

  next();
});

export function useAppRouter() {
  return router;
}
