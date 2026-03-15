import type { Config } from 'tailwindcss'
import forms from '@tailwindcss/forms';

export default {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      zIndex: {
        'map': '60',
        'on-map-1': '61',
        'on-map-2': '62',
        'sidebar': '200',
        'modal-bg': '899',
        'modal': '900',
        'toastr': '999'
      }
    },
  },
  plugins: [
    forms,
  ],
} satisfies Config

