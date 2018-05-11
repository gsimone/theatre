import * as assert from 'assert'
import * as t from '$shared/ioTypes'
import { assertSuccess, assertFailure, DateFromNumber } from './testHelpers'

describe('intersection', () => {
  it('should succeed validating a valid value', () => {
    const T = t.intersection([t.interface({ a: t.number }), t.interface({ b: t.number })])
    assertSuccess(T.rootValidate({ a: 1, b: 2 }))
  })

  it('should fail validating an invalid value', () => {
    const T = t.intersection([t.interface({ a: t.number }), t.interface({ b: t.number })])
    assertFailure(T.rootValidate({ a: 1 }), [
      'Invalid value undefined supplied to : ({ a: number } & { b: number })/b: number'
    ])
  })

  it('should type guard', () => {
    const T = t.intersection([t.interface({ a: DateFromNumber }), t.interface({ b: t.number })])
    assert.strictEqual(T.is({ a: new Date(0), b: 1 }), true)
    assert.strictEqual(T.is({ a: new Date(0) }), false)
    assert.strictEqual(T.is(undefined), false)
  })
})
