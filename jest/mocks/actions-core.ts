// @actions/core v3 is ESM-only ("type": "module" with no require condition in
// its exports map), which jest cannot resolve. Nothing under test calls into
// it, the tests only silence its logging, so they get this surface instead.

export function debug(_message: string): void {}

export function error(_message: string | Error): void {}

export function info(_message: string): void {}

export function notice(_message: string | Error): void {}

export function warning(_message: string | Error): void {}

export function setFailed(_message: string | Error): void {}

export function getInput(_name: string, _options?: { required?: boolean }): string {
  return '';
}

export function setOutput(_name: string, _value: unknown): void {}
