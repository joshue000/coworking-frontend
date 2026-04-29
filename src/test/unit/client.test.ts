import { describe, it, expect } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import { getErrorMessage, isFatalError } from '@/api/client';

function makeAxiosError(status: number, data: unknown): AxiosError {
  return new AxiosError(
    'Request failed',
    String(status),
    { headers: new AxiosHeaders() } as never,
    null,
    {
      status,
      data,
      statusText: String(status),
      headers: new AxiosHeaders(),
      config: { headers: new AxiosHeaders() },
    }
  );
}

function makeNetworkError(): AxiosError {
  return new AxiosError('Network Error', 'ERR_NETWORK');
}

describe('getErrorMessage', () => {
  it('extracts nested error.message from backend format', () => {
    const err = makeAxiosError(400, { error: { message: 'Invalid input' } });
    expect(getErrorMessage(err)).toBe('Invalid input');
  });

  it('extracts flat error string', () => {
    const err = makeAxiosError(400, { error: 'Bad request' });
    expect(getErrorMessage(err)).toBe('Bad request');
  });

  it('extracts flat message string', () => {
    const err = makeAxiosError(400, { message: 'Something went wrong' });
    expect(getErrorMessage(err)).toBe('Something went wrong');
  });

  it('returns 401 message for unauthorized', () => {
    const err = makeAxiosError(401, {});
    expect(getErrorMessage(err)).toBe('Invalid or missing API key.');
  });

  it('returns 404 message for not found', () => {
    const err = makeAxiosError(404, {});
    expect(getErrorMessage(err)).toBe('Resource not found.');
  });

  it('returns 409 message for conflict', () => {
    const err = makeAxiosError(409, {});
    expect(getErrorMessage(err)).toBe('Conflict: the operation could not be completed.');
  });

  it('returns server error message for 5xx', () => {
    const err = makeAxiosError(500, {});
    expect(getErrorMessage(err)).toBe('Server error. Please try again later.');
  });

  it('returns network error message when no response', () => {
    const err = makeNetworkError();
    expect(getErrorMessage(err)).toBe('No internet connection. Please check your network.');
  });

  it('returns fallback for non-axios errors', () => {
    expect(getErrorMessage(new Error('plain error'))).toBe(
      'An unexpected error occurred. Please try again.'
    );
    expect(getErrorMessage(null)).toBe('An unexpected error occurred. Please try again.');
  });
});

describe('isFatalError', () => {
  it('returns true for 5xx errors', () => {
    expect(isFatalError(makeAxiosError(500, {}))).toBe(true);
    expect(isFatalError(makeAxiosError(503, {}))).toBe(true);
  });

  it('returns false for 4xx errors', () => {
    expect(isFatalError(makeAxiosError(400, {}))).toBe(false);
    expect(isFatalError(makeAxiosError(404, {}))).toBe(false);
  });

  it('returns true for network errors', () => {
    expect(isFatalError(makeNetworkError())).toBe(true);
  });

  it('returns true for non-axios errors', () => {
    expect(isFatalError(new Error('unknown'))).toBe(true);
    expect(isFatalError(null)).toBe(true);
  });
});
