import { fileURLToPath } from 'url'
import path from 'path'

/**
 * Project: jophiel-cors-anywhere  <br>
 * getDirName <br>
 *
 * <pre>
 *   Description:
 * </pre>
 *
 * @author wonhyeokchoi <br>
 *     Date: 2025-04-02 <br>
 *     Time: PM 4:48 <br>
 */

export function getDirName() {
  return path.dirname(fileURLToPath(import.meta.url))
}
