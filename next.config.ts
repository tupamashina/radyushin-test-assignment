import { createVanillaExtractPlugin } from '@vanilla-extract/next-plugin';

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  compiler: { removeConsole: process.env.NODE_ENV === 'production' },
};

const withVanillaExtract = createVanillaExtractPlugin();
export default withVanillaExtract(nextConfig);
