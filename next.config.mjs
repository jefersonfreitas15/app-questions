/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        // O caminho "falso" seguro que o seu site vai usar
        source: '/api-banco/:path*',
        // O caminho "real" não seguro do seu servidor (Verifique se a porta é a 8000)
        destination: 'http://2.25.243.144:8000/:path*', 
      },
    ];
  },
};

export default nextConfig;
