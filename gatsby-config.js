module.exports = {
  siteMetadata: {
    title: 'DJ Joemygoodness',
  },
  plugins: [
    {
      resolve: 'gatsby-plugin-google-analytics',
      options: {
        trackingId: 'UA-143852563-1',
        head: true
      }
    },
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
    'gatsby-plugin-sass',
    'gatsby-plugin-react-helmet'
  ]
};
