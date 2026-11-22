/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingIncludes: {
    "/*": ["./public/fonts/amiri/*.ttf"],
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "empreinteflex.com",
        port: "",
        pathname: "/product-images/**",
        search: "",
      },
      {
        protocol: "https",
        hostname: "initwjuydablyalgmeqt.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/product_images/**",
        search: "",
      },
    ],
  },

  async rewrites() {
    return [
      {source: "/v1/:path*", destination: `${process.env.API_INTERNAL_URL || "http://localhost:3001"}/v1/:path*`},
    ];
  },

  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "www\\.empreinteflex\\.com",
          },
        ],
        destination: "https://empreinteflex.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
