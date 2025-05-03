import { readFile } from "node:fs/promises"

import { ins2conv2name2mdl2conv } from "../../wasm2float2float.mjs"
import { bind, of } from "../../io.mjs"

/**
 * @import { IO } from "../../io.mjs"
 */

/**
 * @import { FloatToFloat, InsToConv, FilenameToBuffer } from "../../wasm2float2float.mjs"
 */

/** @type FilenameToBuffer */
const filename2buf = (filename) => {
  return () => {
    return readFile(filename)
      .then((nbuf) => nbuf.buffer)
  }
}

/** @type IO<string> */
const wasmFilename = of("./add.wasm")

/** @type InsToConv */
const ins2conv = (instance) => {
  /** @type WebAssembly.Exports */
  const exports = instance.exports

  /** @type WebAssembly.ExportValue */
  const add_double = exports["add_double"]

  if ("function" !== typeof add_double) return Promise.reject("invalid module")

  /** @type FloatToFloat */
  const f2f = (f) => {
    return () => {
      // adds 1.0
      return add_double(f, 1.0)
    }
  }

  return Promise.resolve(f2f)
}

/** @type function(FilenameToBuffer): function(string): IO<FloatToFloat> */
const name2buf2name2conv = ins2conv2name2mdl2conv(ins2conv)

/** @type function(string): IO<FloatToFloat> */
const name2conv = name2buf2name2conv(filename2buf)

/** @type IO<FloatToFloat> */
const iconv = bind(wasmFilename, name2conv)

/** @type function(number): IO<Void> */
const float2stdout = (f) => () => {
  return Promise.resolve()
    .then((_) => console.info(f))
}

/** @type IO<Void> */
const main = () => {
  return Promise.resolve()
    .then((_) => {
      return iconv()
    })
    .then((conv) => {
      /** @type number */
      const input = 42.195

      /** @type IO<number> */
      const iout = conv(input)

      /** @type IO<Void> */
      const iwrite = float2stdout(input)

      /** @type IO<Void> */
      const owrite = bind(iout, float2stdout)

      /** @type Promise<Void[]> */
      const wrote = Promise.all([iwrite(), owrite()])

      return wrote.then((_) => undefined)
    })
}

main().catch(console.error)
