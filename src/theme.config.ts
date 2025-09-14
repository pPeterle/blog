import { defineThemeConfig } from './types'

export default defineThemeConfig({
  site: 'https://phpeterle.com',
  title: '@phpeterle Blog',
  description: 'A personal blog for @phpeterle',
  author: 'Pedro Peterle',
  navbarItems: [
    { label: 'Blog', href: '/posts/' },
    // { label: 'Projects', href: '/projects/' },
    { label: 'Tags', href: '/tags/' },
    { label: 'About', href: '/about/' },
    // {
    //   label: 'Other pages',
    //   children: [
    //     { label: 'Landing page', href: '/' },
    //     { label: '404 page', href: '/404' },
    //     { label: 'Author: FjellOverflow', href: '/authors/FjellOverflow/' },
    //     { label: 'Tag: documentation', href: '/tags/documentation/' }
    //   ]
    // }
  ],
  footerItems: [
    {
      icon: 'tabler--brand-github',
      href: 'https://github.com/pPeterle',
      label: 'Github'
    },
    {
      icon: 'tabler--rss',
      href: '/feed.xml',
      label: 'RSS feed'
    }
  ],

  // optional settings
  locale: 'pt-BR',
  mode: 'dark',
  modeToggle: true,
  colorScheme: 'scheme-mono',
  openGraphImage: undefined,
  postsPerPage: 50,
  projectsPerPage: 50,
  scrollProgress: false,
  scrollToTop: true,
  tagIcons: {
    tailwindcss: 'tabler--brand-tailwind',
    astro: 'tabler--brand-astro',
    documentation: 'tabler--book'
  },
  expressiveCodeThemes: ['vitesse-light', 'vitesse-black']
})
