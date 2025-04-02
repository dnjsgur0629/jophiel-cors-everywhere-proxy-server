import yaml from 'js-yaml'
import fs from 'fs'

/**
 * Project: jophiel-cors-anywhere  <br>
 * constants <br>
 *
 * <pre>
 *   Description:
 * </pre>
 *
 * @author wonhyeokchoi <br>
 *     Date: 2025-04-01 <br>
 *     Time: AM 10:21 <br>
 */

export const ENV = process.env.NODE_ENV || 'development'

export const isProd = ENV === 'production'

export const HOST = '0.0.0.0'
export const PORT = isProd ? '17000' : '18000'

const domainList = yaml.load(fs.readFileSync('config/domainList.yaml'), 'utf8')
export const WHITE_LIST = domainList[ENV]['WHITE_LIST'] ?? []
export const BLACK_LIST = domainList[ENV]['BLACK_LIST'] ?? []
