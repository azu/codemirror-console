// License: MIT
// https://github.com/syumai/sandboxed-eval
/**
 *
 * @param origin
 * @param senderId
 * @param receiverId
 * @param {"module" | "script" | "AsyncFunction"} type
 */
const createSrcDoc = ({ origin, senderId, receiverId, type }) => {
    // script does not require <script> because just use eval on contextWindow
    if (type === "script") {
        return `<!doctype html>
<html lang="en">
<body></body>
</html>`;
    }
    return `<!doctype html>
<html lang="en">
<body>
<script>
const origin = "${origin}";
const senderId = "${senderId}";
const receiverId = "${receiverId}";
const handleMessage = async (event) => {
  if (event.source !== window.parent) {
    return;
  }
  if (event.origin !== origin) {
    return;
  }
  const { id, src } = event.data || {};
  if (id !== receiverId) {
    return;
  }
  try {
    const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
    ${(() => {
        if (type === "module") {
            // module can not get result
            return (
                "await import(`data:text/javascript;charset=utf-8, ${encodeURIComponent(src)}`);" +
                "window.parent.postMessage({ id: senderId, result: undefined }, origin);"
            );
        } else if (type === "AsyncFunction") {
            // new AsyncFunction cano not get result
            return (
                "await new AsyncFunction(src)();" +
                "window.parent.postMessage({ id: senderId, result: undefined }, origin);"
            );
        } else {
            return "const result = eval(src);" + "window.parent.postMessage({ id: senderId, result }, origin);";
        }
    })()};
  } catch (error) {
    window.parent.postMessage({ id: senderId, error: {message:error.message} }, origin);
  }
  window.removeEventListener("message", handleMessage);
};
window.addEventListener("message", handleMessage);
window.parent.postMessage({ id: senderId, ready: true }, origin);
</script>
</body>
</html>`;
};

function genId() {
    return Array.from(crypto.getRandomValues(new Uint32Array(4)))
        .map((n) => n.toString(36))
        .join("");
}

/**
 * @returns {{run: (function(string, Object=, {type: ("module"|"script"|"AsyncFunction")}=): Promise<*>), remove: remove}}
 */
function createContextEval() {
    const iframe = document.createElement("iframe");
    iframe.setAttribute("style", "display: none;");
    const senderId = genId();
    const receiverId = genId();
    return {
        remove: () => {
            document.body.removeChild(iframe);
        },
        /**
         * @param {string} src
         * @param {object} [scope]
         * @param {{ type: "module" | "script" | "AsyncFunction" }} [options]
         * @returns {Promise<unknown>}
         */
        run: (src, scope = {}, options = {}) => {
            return new Promise((resolve, reject) => {
                // type: "module" | "AsyncFunction"
                const handleMessage = (event) => {
                    if (event.source !== iframe.contentWindow) {
                        return;
                    }
                    const { id, result, error, ready } = event.data || {};
                    if (id !== senderId) {
                        return;
                    }
                    if (ready) {
                        iframe.contentWindow.postMessage({ id: receiverId, src }, "*");
                        return;
                    }
                    if (error) {
                        reject(new Error(error.message));
                    } else {
                        resolve(result);
                    }
                    window.removeEventListener("message", handleMessage);
                };
                window.addEventListener("message", handleMessage);
                const executionType = options.type ? options.type : "script";
                iframe.srcdoc = createSrcDoc({
                    origin: window.location.origin,
                    senderId,
                    receiverId,
                    type: executionType
                });
                iframe.dataset.mirrorConsole = executionType;
                document.body.appendChild(iframe);
                // inject global
                // avoid CloneError via postMessage
                const iframeWindow = iframe.contentWindow;
                Object.keys(scope).forEach(function (key) {
                    iframeWindow[key] = scope[key];
                });
                // type: script just use eval
                // does not use postMessage, because postMessage restrict transferable object
                if (executionType === "script") {
                    try {
                        resolve(iframeWindow.eval(src));
                    } catch (error) {
                        reject(error);
                    }
                }
            });
        }
    };
}

module.exports.createContextEval = createContextEval;
