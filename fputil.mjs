/**
 * @template T
 * @template U
 * @template V
 * @param {function(T, U): V} f
 * @returns {function(T): function(U): V}
 */
export function curry(f) {
  return (t) => (u) => f(t, u);
}
