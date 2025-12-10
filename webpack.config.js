const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  
  // Configurações para PWA
  config.output.publicPath = '/';
  config.devServer = {
    ...config.devServer,
    historyApiFallback: true,
    hot: true,
    port: 3000
  };
  
  return config;
};