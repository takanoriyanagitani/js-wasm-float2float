import { bind } from "./io.mjs"
import { curry } from "./fputil.mjs"

/**
 * @import { IO } from "./io.mjs"
 */

/**
 * @typedef {function(number): IO<number>} FloatToFloat
 */

/**
 * @typedef {function(WebAssembly.Instance): Promise<FloatToFloat>} InsToConv
 */

/**
 * @param {InsToConv} ins2fn
 * @param {WebAssembly.Module} wmod
 * @returns {IO<FloatToFloat>}
 */
export function wasmModuleToFloatToFloat(
  ins2fn,
  wmod,
) {
  return () => {
    /** @type Promise<WebAssembly.Instance> */
    const wins = WebAssembly.instantiate(wmod)

    return wins.then(ins2fn)
  }
}

/** @type function(InsToConv): function(WebAssembly.Module): IO<FloatToFloat> */
export const ins2conv2mdl2conv = curry(wasmModuleToFloatToFloat)

/**
 * @param {ArrayBuffer} wbuf The wasm bytes.
 * @returns {IO<WebAssembly.Module>}
 */
export function wasmBytes2module(wbuf) {
  return () => {
    return WebAssembly.compile(wbuf)
  }
}

/**
 * @param {string} url The url to the wasm bytes.
 * @returns {IO<Response>}
 */
export function url2res(url) {
  return () => {
    return Promise.resolve()
      .then((_) => fetch(url))
  }
}

/**
 * @param {Response} res
 * @returns {IO<ArrayBuffer>}
 */
export function res2buf(res) {
  return () => {
    return Promise.resolve()
      .then((_) => res.arrayBuffer())
  }
}

/**
 * @param {string} url
 * @returns {IO<ArrayBuffer>}
 */
export function url2buf(url) {
  /** @type IO<Response> */
  const ires = url2res(url)
  return bind(ires, res2buf)
}

/**
 * @param {string} url
 * @returns {IO<WebAssembly.Module>}
 */
export function url2module(url) {
  /** @type IO<ArrayBuffer> */
  const ibuf = url2buf(url)
  return bind(ibuf, wasmBytes2module)
}

/**
 * @param {InsToConv} ins2conv
 * @returns {function(string): IO<FloatToFloat>}
 */
export function ins2conv2url2mdl2conv(ins2conv) {
  /** @type function(WebAssembly.Module): IO<FloatToFloat> */
  const mdl2conv = ins2conv2mdl2conv(ins2conv)

  return (url) => {
    return bind(url2module(url), mdl2conv)
  }
}

/**
 * @typedef {function(string): IO<ArrayBuffer>} FilenameToBuffer
 */

/**
 * @param {InsToConv} ins2conv
 * @returns {function(FilenameToBuffer): function(string): IO<FloatToFloat>}
 */
export function ins2conv2name2mdl2conv(ins2conv) {
  /** @type function(WebAssembly.Module): IO<FloatToFloat> */
  const mdl2conv = ins2conv2mdl2conv(ins2conv)

  /** @type function(ArrayBuffer): IO<WebAssembly.Module> */
  const buf2mod = wasmBytes2module

  return (name2buf) => {
    /** @type function(string): IO<WebAssembly.Module> */
    const name2mod = (name) => {
      /** @type IO<ArrayBuffer> */
      const ibuf = name2buf(name)

      return bind(ibuf, buf2mod)
    }

    /** @type function(string): IO<FloatToFloat> */
    const name2conv = (name) => {
      /** @type IO<WebAssembly.Module> */
      const imod = name2mod(name)

      return bind(imod, mdl2conv)
    }

    return name2conv
  }
}
