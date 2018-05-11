import * as t from '$shared/ioTypes'
import * as assert from 'assert'
import {
  DateFromNumber,
  IntegerFromString,
  assertFailure,
  assertSuccess,
} from './testHelpers'

describe('refinement', () => {
  it('should succeed validating a valid value', () => {
    const T = t.refinement(t.number, n => n >= 0)
    assertSuccess(T.rootValidate(0))
    assertSuccess(T.rootValidate(1))
  })

  it('should fail validating an invalid value', () => {
    const T = t.Integer
    assertFailure(T.rootValidate('a'), ['Invalid value "a" supplied to : Integer'])
    assertFailure(T.rootValidate(1.2), ['Invalid value 1.2 supplied to : Integer'])
  })

  it('should fail with the last deserialized value', () => {
    const T = IntegerFromString
    assertFailure(T.rootValidate('a'), [
      'Invalid value "a" supplied to : IntegerFromString',
    ])
    assertFailure(T.rootValidate('1.2'), [
      'Invalid value 1.2 supplied to : IntegerFromString',
    ])
  })

  it('should return the same reference when serializing', () => {
    const T = t.refinement(t.array(t.number), () => true)
    assert.strictEqual(T.encode, t.identity)
  })

  it('should type guard', () => {
    const T = t.Integer
    assert.strictEqual(T.is(1.2), false)
    assert.strictEqual(T.is('a'), false)
    assert.strictEqual(T.is(1), true)
  })
})
