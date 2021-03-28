export function isHTMLElement($el) {
    return (typeof $el === "object" && typeof $el.querySelector === "function");
}

export function isNumber(n) {
    return Object.prototype.toString.call(n) === "[object Number]";
}

export function assert(flag, errorDescription) {
    if (!flag) {
        throw new Error(`Assertion error. ${errorDescription}`);
    }
} 
  