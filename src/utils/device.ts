/**
 * 设备识别：区分 PC 网页与手机网页。
 * 手机浏览器访问 PC 官网时，首页给出「前往手机版」提示横幅（不强制跳转）。
 */
export function isMobileDevice(ua: string = navigator.userAgent): boolean {
  // 排除 iPadOS 13+ 桌面 UA：Macintosh + 触屏
  const mobileRE = /Android|iPhone|iPod|Windows Phone|Mobile|HarmonyOS/i
  const iPadOS =
    /Macintosh/i.test(ua) && navigator.maxTouchPoints > 1
  return mobileRE.test(ua) || iPadOS
}

/**
 * 手机网页（uni-app H5 版）地址。
 * - 生产：同域名 /m/（nginx 把 /m/ 指向手机版静态目录，接口前缀反代后端）
 * - 开发：HBuilderX/uni H5 跑在 5175 端口、base=/m/；
 *   也可用 VITE_MOBILE_URL 覆盖（例如真机联调时填局域网地址）
 */
export function mobileSiteUrl(): string {
  const override = import.meta.env.VITE_MOBILE_URL
  if (override) return String(override)
  return import.meta.env.DEV ? 'http://localhost:5175/m/' : '/m/'
}
