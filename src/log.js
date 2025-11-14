function logger_log(tag, msg) {
  if (typeof _info === 'function') _info(`[${tag}] ${msg}`);
  else console.log(`[${tag}]: ${msg}`);
}
function logger_warn(tag, msg) {
  if (typeof _warn === 'function') _warn(`[${tag}] ${msg}`);
  else console.warn(`[${tag}]: ${msg}`);
}
function logger_error(tag, msg) {
  if (typeof _err === 'function') _err(`[${tag}] ${msg}`);
  else console.error(`[${tag}]: ${msg}`);
}
