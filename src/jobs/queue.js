/**
 * Universidad de La Laguna
 * Computación en la nube
 * @author Marcos Barrios
 * @since 26_06_2024
 *
 */

'use strict';

export default class Queue {
  /** @private @constant */
  #queue = undefined

  constructor() {
    this.#queue = [];
  }

  add(job) {
    this.#queue.push(job);
  }

  next() {
    if (this.#queue.length > 0) {
      return this.#queue.unshift();
    }
    return null;
  }
}
