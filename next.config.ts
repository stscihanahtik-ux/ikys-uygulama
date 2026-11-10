import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["docx", "exceljs", "pdf-lib", "@pdf-lib/fontkit"],
};

export default nextConfig;
