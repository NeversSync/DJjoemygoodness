module.exports = {
  siteMetadata: {
    title: 'DJ Joemygoodness'
  },
  plugins: [
    // {
    //   resolve: 'gatsby-plugin-favicon',
    //   options: {
    //     logo: './public/assets/img/tea-favicon.png',
    //     // TODO
    //     appName: null, // Inferred with your package.json
    //     appDescription: null,
    //     developerName: null,
    //     developerURL: null,
    //     dir: 'auto',
    //     lang: 'en-US',
    //     background: '#fff',
    //     theme_color: '#fff',
    //     display: 'standalone',
    //     orientation: 'any',
    //     start_url: '/?homescreen=1',
    //     version: '1.0'
    //   }
    // },
    // {
    //   // TODO
    //   resolve: 'gatsby-plugin-google-analytics',
    //   options: {
    //     trackingId: 'UA-134726933-2',
    //     head: true
    //   }
    // },
    { resolve: 'gatsby-plugin-styled-components' },
    {
      resolve: 'gatsby-source-instagram-all',
      options: {
        access_token: '6836969639.dd74a62.24cbd1a1d3504825baab9f6e9771227b'
      }
    },
    {
      resolve: 'gatsby-plugin-sharp',
      options: {
        useMozJpeg: false,
        stripMetadata: true,
        defaultQuality: 75,
      },
    },
    'gatsby-transformer-sharp',
    'gatsby-plugin-sass'
  ]
};
