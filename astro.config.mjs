import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  site: 'https://dryliningedinburgh.co.uk',
  build: {
    format: 'directory'
  }
});
