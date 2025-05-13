module.exports = {
  webpack: (config: any, options: any) => {
      config.module.rules.push({
        test: /\.node/,
        use: 'node-loader'
      })
   
      return config
    },
};

// export default nextConfig;
