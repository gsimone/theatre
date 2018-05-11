import * as t from '$shared/ioTypes'
import * as assert from 'assert'
import {assertFailure, assertSuccess} from './testHelpers'

describe('exact', () => {
  it('should succeed validating a valid value (type)', () => {
    const T = t.exact(t.type({foo: t.string}))
    assertSuccess(T.rootValidate({foo: 'foo'}))
  })

  it('should succeed validating a valid value (partial)', () => {
    const T = t.exact(t.partial({foo: t.string}))
    assertSuccess(T.rootValidate({foo: 'foo'}))
    assertSuccess(T.rootValidate({foo: undefined}))
    assertSuccess(T.rootValidate({}))
  })

  it('should succeed validating a valid value (intersection)', () => {
    const T = t.exact(
      t.intersection([t.type({foo: t.string}), t.partial({bar: t.number})]),
    )
    assertSuccess(T.rootValidate({foo: 'foo', bar: 1}))
    assertSuccess(T.rootValidate({foo: 'foo', bar: undefined}))
    assertSuccess(T.rootValidate({foo: 'foo'}))
  })

  it('should succeed validating a valid value (refinement)', () => {
    const T = t.exact(
      t.refinement(t.type({foo: t.string}), p => p.foo.length > 2),
    )
    assertSuccess(T.rootValidate({foo: 'foo'}))
  })

  it('should succeed validating a valid value (readonly)', () => {
    const T = t.exact(t.readonly(t.type({foo: t.string})))
    assertSuccess(T.rootValidate({foo: 'foo'}))
  })

  it('should succeed validating an undefined field', () => {
    const T = t.exact(
      t.type({foo: t.string, bar: t.union([t.string, t.undefined])}),
    )
    assertSuccess(T.rootValidate({foo: 'foo'}))
  })

  it('should fail validating an invalid value (type)', () => {
    const T = t.exact(t.type({foo: t.string}))
    assertFailure(T.rootValidate({foo: 'foo', bar: 1, baz: true}), [
      'Invalid value 1 supplied to : ExactType<{ foo: string }>/bar: never',
      'Invalid value true supplied to : ExactType<{ foo: string }>/baz: never',
    ])
  })

  it('should fail validating an invalid value (partial)', () => {
    const T = t.exact(
      t.intersection([t.type({foo: t.string}), t.partial({bar: t.number})]),
    )
    assertFailure(T.rootValidate({foo: 'foo', baz: true}), [
      'Invalid value true supplied to : ExactType<({ foo: string } & PartialType<{ bar: number }>)>/baz: never',
    ])
  })

  it('should fail validating an invalid value (intersection)', () => {
    const T = t.exact(t.partial({foo: t.string}))
    assertFailure(T.rootValidate({bar: 1}), [
      'Invalid value 1 supplied to : ExactType<PartialType<{ foo: string }>>/bar: never',
    ])
  })

  it('should fail validating an invalid value (refinement)', () => {
    const T = t.exact(
      t.refinement(t.type({foo: t.string}), p => p.foo.length > 2),
    )
    assertFailure(T.rootValidate({foo: 'foo', bar: 1}), [
      'Invalid value 1 supplied to : ExactType<({ foo: string } | <function1>)>/bar: never',
    ])
  })

  it('should fail validating an invalid value (readonly)', () => {
    const T = t.exact(t.readonly(t.type({foo: t.string})))
    assertFailure(T.rootValidate({foo: 'foo', bar: 1}), [
      'Invalid value 1 supplied to : ExactType<Readonly<{ foo: string }>>/bar: never',
    ])
  })

  it('should assign a default name', () => {
    const T1 = t.exact(t.type({foo: t.string}), 'Foo')
    assert.strictEqual(T1.name, 'Foo')
    const T2 = t.exact(t.type({foo: t.string}))
    assert.strictEqual(T2.name, 'ExactType<{ foo: string }>')
  })

  it('should type guard', () => {
    const T1 = t.exact(t.type({a: t.number}))
    assert.strictEqual(T1.is({a: 0}), true)
    assert.strictEqual(T1.is({a: 0, b: 1}), false)
    assert.strictEqual(T1.is(undefined), false)
  })
})