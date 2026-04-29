import { tokoSQL } from './toko.sql';
import { perusahaanSQL } from './perusahaan.sql';
import { ecommerceSQL } from './ecommerce.sql';
import { blogSQL } from './blog.sql';
import { analitikSQL } from './analitik.sql';
import type { DatabaseType } from '../../types';

export const databases: Record<DatabaseType, string> = {
  toko: tokoSQL,
  perusahaan: perusahaanSQL,
  ecommerce: ecommerceSQL,
  blog: blogSQL,
  analitik: analitikSQL,
};
