/**
 * @jest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react'

import { toast, useToast, reducer } from '../use-toast'

beforeEach(() => jest.useFakeTimers())
afterEach(() => jest.useRealTimers())

// ── reducer unit tests (pure, no shared state) ────────────────────────────────

describe('reducer', () => {
  it('ADD_TOAST appends a toast', () => {
    const state = reducer({ toasts: [] }, {
      type: 'ADD_TOAST',
      toast: { id: '1', title: 'Hello', open: true },
    })
    expect(state.toasts).toHaveLength(1)
    expect(state.toasts[0].title).toBe('Hello')
  })

  it('DISMISS_TOAST sets open=false', () => {
    const state = reducer(
      { toasts: [{ id: '1', title: 'Hi', open: true }] },
      { type: 'DISMISS_TOAST', toastId: '1' },
    )
    expect(state.toasts[0].open).toBe(false)
  })

  it('REMOVE_TOAST removes by id', () => {
    const state = reducer(
      { toasts: [{ id: '1', title: 'Hi', open: false }] },
      { type: 'REMOVE_TOAST', toastId: '1' },
    )
    expect(state.toasts).toHaveLength(0)
  })
})

// ── toast() integration tests ─────────────────────────────────────────────────
// Each test uses a unique title to identify its own toast in shared state.

describe('toast()', () => {
  it('displays a toast', () => {
    const { result } = renderHook(() => useToast())
    const title = `Test-${Date.now()}-display`
    act(() => { toast({ title, duration: 0 }) })
    expect(result.current.toasts.some(t => t.title === title)).toBe(true)
  })

  it('auto-dismisses after default duration (5 s)', () => {
    const { result } = renderHook(() => useToast())
    const title = `Test-${Date.now()}-auto`
    act(() => { toast({ title }) })
    expect(result.current.toasts.some(t => t.title === title && t.open)).toBe(true)
    act(() => { jest.advanceTimersByTime(5000) })
    expect(result.current.toasts.some(t => t.title === title && t.open)).toBe(false)
  })

  it('auto-dismisses after custom duration', () => {
    const { result } = renderHook(() => useToast())
    const title = `Test-${Date.now()}-custom`
    act(() => { toast({ title, duration: 2000 }) })
    act(() => { jest.advanceTimersByTime(1999) })
    expect(result.current.toasts.some(t => t.title === title && t.open)).toBe(true)
    act(() => { jest.advanceTimersByTime(1) })
    expect(result.current.toasts.some(t => t.title === title && t.open)).toBe(false)
  })

  it('does not auto-dismiss when duration=0', () => {
    const { result } = renderHook(() => useToast())
    const title = `Test-${Date.now()}-persist`
    act(() => { toast({ title, duration: 0 }) })
    act(() => { jest.advanceTimersByTime(60000) })
    expect(result.current.toasts.some(t => t.title === title && t.open)).toBe(true)
  })

  it('manual dismiss closes the toast', () => {
    const { result } = renderHook(() => useToast())
    const title = `Test-${Date.now()}-manual`
    let handle: ReturnType<typeof toast>
    act(() => { handle = toast({ title, duration: 0 }) })
    act(() => { handle!.dismiss() })
    expect(result.current.toasts.some(t => t.title === title && t.open)).toBe(false)
  })
})

describe('toast variant helpers', () => {
  it('toast.success sets variant=success', () => {
    const { result } = renderHook(() => useToast())
    const title = `Success-${Date.now()}`
    act(() => { toast.success(title) })
    expect(result.current.toasts.some(t => t.variant === 'success' && t.title === title)).toBe(true)
  })

  it('toast.warning sets variant=warning', () => {
    const { result } = renderHook(() => useToast())
    const title = `Warning-${Date.now()}`
    act(() => { toast.warning(title) })
    expect(result.current.toasts.some(t => t.variant === 'warning' && t.title === title)).toBe(true)
  })

  it('toast.info sets variant=info', () => {
    const { result } = renderHook(() => useToast())
    const title = `Info-${Date.now()}`
    act(() => { toast.info(title) })
    expect(result.current.toasts.some(t => t.variant === 'info' && t.title === title)).toBe(true)
  })

  it('toast.error sets variant=destructive', () => {
    const { result } = renderHook(() => useToast())
    const title = `Error-${Date.now()}`
    act(() => { toast.error(title) })
    expect(result.current.toasts.some(t => t.variant === 'destructive' && t.title === title)).toBe(true)
  })
})
