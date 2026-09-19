/**
 * Some Windows volumes (e.g. sync/network mounts) return EISDIR from
 * fs.readlink on normal files and directories. Webpack treats that as fatal.
 * Map those errors to EINVAL so enhanced-resolve treats the path as non-symlink.
 */
const fs = require('fs');

function wrapReadlink(original) {
  return function patchedReadlink(path, options, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = undefined;
    }
    return original.call(this, path, options, (err, linkString) => {
      if (err && (err.code === 'EISDIR' || err.code === 'EPERM')) {
        const mapped = new Error(err.message);
        mapped.code = 'EINVAL';
        mapped.errno = err.errno;
        mapped.path = err.path;
        return callback(mapped);
      }
      return callback(err, linkString);
    });
  };
}

function wrapReadlinkSync(original) {
  return function patchedReadlinkSync(path, options) {
    try {
      return original.call(this, path, options);
    } catch (err) {
      if (err && (err.code === 'EISDIR' || err.code === 'EPERM')) {
        const mapped = new Error(err.message);
        mapped.code = 'EINVAL';
        mapped.errno = err.errno;
        mapped.path = err.path;
        throw mapped;
      }
      throw err;
    }
  };
}

fs.readlink = wrapReadlink(fs.readlink.bind(fs));
fs.readlinkSync = wrapReadlinkSync(fs.readlinkSync.bind(fs));

if (fs.promises && fs.promises.readlink) {
  const original = fs.promises.readlink.bind(fs.promises);
  fs.promises.readlink = async function patchedPromisesReadlink(path, options) {
    try {
      return await original(path, options);
    } catch (err) {
      if (err && (err.code === 'EISDIR' || err.code === 'EPERM')) {
        const mapped = new Error(err.message);
        mapped.code = 'EINVAL';
        mapped.errno = err.errno;
        mapped.path = err.path;
        throw mapped;
      }
      throw err;
    }
  };
}
