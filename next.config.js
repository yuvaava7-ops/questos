/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack(config) {
    // Import .svg files under icons/ as React components, e.g.
    // `import Sword from "@/icons/game/sword.svg"` -> <Sword size={16} />
    const fileLoaderRule = config.module.rules.find((rule) => rule.test?.test?.(".svg"));
    config.module.rules.push(
      { ...fileLoaderRule, test: /\.svg$/i, resourceQuery: /url/ },
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule.issuer,
        resourceQuery: { not: [...(fileLoaderRule.resourceQuery?.not ?? []), /url/] },
        use: [
          {
            loader: "@svgr/webpack",
            options: {
              // The game-icons.net pack ships hardcoded fill="#000" — rewrite
              // to currentColor so icons recolor via Tailwind text-* classes
              // like the rest of the app's icons (lucide) already do.
              svgoConfig: {
                plugins: [{ name: "convertColors", params: { currentColor: true } }],
              },
            },
          },
        ],
      }
    );
    fileLoaderRule.exclude = /\.svg$/i;
    return config;
  },
};
module.exports = nextConfig;
