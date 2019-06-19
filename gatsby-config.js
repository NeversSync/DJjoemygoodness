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
    // { resolve: 'gatsby-plugin-styled-components' },
    // {
    //   resolve: 'gatsby-source-instagram-all',
    //   options: {
    //     // TODO
    //     access_token: '2106430508.b82821b.83d3f9fc2ec341ac8d3b0e45c24e151f'
    //   }
    // },
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
