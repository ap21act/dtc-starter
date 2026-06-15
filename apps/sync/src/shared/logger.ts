type Level = 'info' | 'warn' | 'error'

function log(level: Level, scope: string, msg: string, extra?: unknown) {
  const ts = new Date().toISOString()
  const line = `[${ts}] [${level.toUpperCase()}] [${scope}] ${msg}`
  if (extra !== undefined) {
    ;(level === 'error' ? console.error : console.log)(line, extra)
  } else {
    ;(level === 'error' ? console.error : console.log)(line)
  }
}

export function makeLogger(scope: string) {
  return {
    info: (msg: string, extra?: unknown) => log('info', scope, msg, extra),
    warn: (msg: string, extra?: unknown) => log('warn', scope, msg, extra),
    error: (msg: string, extra?: unknown) => log('error', scope, msg, extra),
  }
}
