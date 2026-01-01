import { defineVitestConfig } from '@nuxt/test-utils/config';

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    include: ['app/**/*.{test,spec}.?(c|m)[jt]s?(x)', 'tests/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
  },
});
